const fill_threshold = 1; // 1 is just enough for a workaround for Brave browser's farbling: https://github.com/1j01/jspaint/issues/184

function get_brush_canvas_size(brush_size, brush_shape) {
	// brush_shape optional, only matters if it's circle
	// @TODO: does it actually still matter? the ellipse drawing code has changed

	// round to nearest even number in order for the canvas to be drawn centered at a point reasonably
	return Math.ceil(brush_size * (brush_shape === "circle" ? 2.1 : 1) / 2) * 2;
}
function render_brush(ctx, shape, size) {
	// USAGE NOTE: must be called outside of any other usage of op_canvas (because of draw_ellipse)
	if (shape.match(/diagonal/)) {
		size -= 0.4;
	}

	const mid_x = Math.round(ctx.canvas.width / 2);
	const left = Math.round(mid_x - size / 2);
	const right = Math.round(mid_x + size / 2);
	const mid_y = Math.round(ctx.canvas.height / 2);
	const top = Math.round(mid_y - size / 2);
	const bottom = Math.round(mid_y + size / 2);

	if (shape === "circle") {
		// @TODO: ideally _without_pattern_support
		draw_ellipse(ctx, left, top, size, size, false, true);
		// was useful for testing:
		// ctx.fillStyle = "red";
		// ctx.fillRect(mid_x, mid_y, 1, 1);
	} else if (shape === "square") {
		ctx.fillRect(left, top, ~~size, ~~size);
	} else if (shape === "diagonal") {
		draw_line_without_pattern_support(ctx, left, top, right, bottom);
	} else if (shape === "reverse_diagonal") {
		draw_line_without_pattern_support(ctx, left, bottom, right, top);
	} else if (shape === "horizontal") {
		draw_line_without_pattern_support(ctx, left, mid_y, size, mid_y);
	} else if (shape === "vertical") {
		draw_line_without_pattern_support(ctx, mid_x, top, mid_x, size);
	}
}

function draw_ellipse(ctx, x, y, w, h, stroke, fill) {
	const center_x = x + w / 2;
	const center_y = y + h / 2;

	if (aliasing) {
		const points = [];
		const step = 0.05;
		for (let theta = 0; theta < TAU; theta += step) {
			points.push({
				x: center_x + Math.cos(theta) * w / 2,
				y: center_y + Math.sin(theta) * h / 2,
			});
		}
		draw_polygon(ctx, points, stroke, fill);
	} else {
		ctx.beginPath();
		ctx.ellipse(center_x, center_y, Math.abs(w / 2), Math.abs(h / 2), 0, TAU, false);
		ctx.stroke();
		ctx.fill();
	}
}

function draw_rounded_rectangle(ctx, x, y, width, height, radius_x, radius_y, stroke, fill) {

	if (aliasing) {
		const points = [];
		const lineTo = (x, y) => {
			points.push({ x, y });
		};
		const arc = (x, y, radius_x, radius_y, startAngle, endAngle) => {
			const step = 0.05;
			for (let theta = startAngle; theta < endAngle; theta += step) {
				points.push({
					x: x + Math.cos(theta) * radius_x,
					y: y + Math.sin(theta) * radius_y,
				});
			}
			// not just doing `theta <= endAngle` above because that doesn't account for floating point rounding errors
			points.push({
				x: x + Math.cos(endAngle) * radius_x,
				y: y + Math.sin(endAngle) * radius_y,
			});
		};

		const x2 = x + width;
		const y2 = y + height;
		arc(x2 - radius_x, y + radius_y, radius_x, radius_y, TAU * 3 / 4, TAU, false);
		lineTo(x2, y2 - radius_y);
		arc(x2 - radius_x, y2 - radius_y, radius_x, radius_y, 0, TAU * 1 / 4, false);
		lineTo(x + radius_x, y2);
		arc(x + radius_x, y2 - radius_y, radius_x, radius_y, TAU * 1 / 4, TAU * 1 / 2, false);
		lineTo(x, y + radius_y);
		arc(x + radius_x, y + radius_y, radius_x, radius_y, TAU / 2, TAU * 3 / 4, false);

		draw_polygon(ctx, points, stroke, fill);
	} else {
		ctx.beginPath();
		ctx.moveTo(x + radius_x, y);
		ctx.lineTo(x + width - radius_x, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius_y);
		ctx.lineTo(x + width, y + height - radius_y);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius_x, y + height);
		ctx.lineTo(x + radius_x, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius_y);
		ctx.lineTo(x, y + radius_y);
		ctx.quadraticCurveTo(x, y, x + radius_x, y);
		ctx.closePath();
		if (stroke) {
			ctx.stroke();
		}
		if (fill) {
			ctx.fill();
		}
	}
}

// USAGE NOTE: must be called outside of any other usage of op_canvas (because of render_brush)
// @TODO: protect against browser clearing canvases, invalidate cache
const get_brush_canvas = memoize_synchronous_function((brush_shape, brush_size) => {
	const canvas_size = get_brush_canvas_size(brush_size, brush_shape);

	const brush_canvas = make_canvas(canvas_size, canvas_size);

	// brush_canvas.ctx.fillStyle = brush_canvas.ctx.strokeStyle = "black";
	render_brush(brush_canvas.ctx, brush_shape, brush_size);

	return brush_canvas;
}, 20); // 12 brush tool options + current brush + current pencil + current eraser + current shape stroke + a few

$G.on("invalidate-brush-canvases", () => {
	get_brush_canvas.clear_memo_cache();
});


// USAGE NOTE: must be called outside of any other usage of op_canvas (because of render_brush)
const stamp_brush_canvas = (ctx, x, y, brush_shape, brush_size) => {
	const brush_canvas = get_brush_canvas(brush_shape, brush_size);

	const offset_x = -Math.ceil(brush_canvas.width / 2);
	const offset_y = -Math.ceil(brush_canvas.height / 2);

	ctx.drawImage(brush_canvas, x + offset_x, y + offset_y);
};

// USAGE NOTE: must be called outside of any other usage of op_canvas (because of render_brush)
const get_circumference_points_for_brush = memoize_synchronous_function((brush_shape, brush_size) => {

	const brush_canvas = get_brush_canvas(brush_shape, brush_size);

	const image_data = brush_canvas.ctx.getImageData(0, 0, brush_canvas.width, brush_canvas.height);

	const at = (x, y) => (
		// coordinate checking is important so it doesn't wrap (if the brush abuts the edge of the canvas)
		x >= 0 && y >= 0 &&
		x < image_data.width && y < image_data.height &&
		image_data.data[(y * image_data.width + x) * 4 + 3] > 127
	);

	const offset_x = -Math.ceil(brush_canvas.width / 2);
	const offset_y = -Math.ceil(brush_canvas.height / 2);

	const points = [];

	for (let x = 0; x < image_data.width; x += 1) {
		for (let y = 0; y < image_data.height; y += 1) {
			if (at(x, y) && (
				!at(x, y - 1) ||
				!at(x, y + 1) ||
				!at(x - 1, y) ||
				!at(x + 1, y)
			)) {
				points.push({
					x: x + offset_x,
					y: y + offset_y,
				});
			}
		}
	}

	return points;
});

$G.on("invalidate-brush-canvases", () => {
	get_circumference_points_for_brush.clear_memo_cache();
});


let line_brush_canvas;
// USAGE NOTE: must be called outside of any other usage of op_canvas (because of render_brush)
function update_brush_for_drawing_lines(stroke_size) {
	if (aliasing && stroke_size > 1) {
		line_brush_canvas = get_brush_canvas("circle", stroke_size);
	}
}

function draw_line_without_pattern_support(ctx, x1, y1, x2, y2, stroke_size = 1) {
	if (aliasing) {
		if (stroke_size > 1) {
			bresenham_line(x1, y1, x2, y2, (x, y) => {
				ctx.drawImage(line_brush_canvas, ~~(x - line_brush_canvas.width / 2), ~~(y - line_brush_canvas.height / 2));
			});
		} else {
			bresenham_line(x1, y1, x2, y2, (x, y) => {
				ctx.fillRect(x, y, 1, 1);
			});
		}
	} else {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);

		ctx.lineWidth = stroke_size;
		ctx.lineCap = "round";
		ctx.stroke();
		ctx.lineCap = "butt";
	}
}

function bresenham_line(x1, y1, x2, y2, callback) {
	// Bresenham's line algorithm
	x1 = ~~x1; x2 = ~~x2; y1 = ~~y1; y2 = ~~y2;

	const dx = Math.abs(x2 - x1);
	const dy = Math.abs(y2 - y1);
	const sx = (x1 < x2) ? 1 : -1;
	const sy = (y1 < y2) ? 1 : -1;
	let err = dx - dy;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		callback(x1, y1);

		if (x1 === x2 && y1 === y2) break;
		const e2 = err * 2;
		if (e2 > -dy) { err -= dy; x1 += sx; }
		if (e2 < dx) { err += dx; y1 += sy; }
	}
}

function bresenham_dense_line(x1, y1, x2, y2, callback) {
	// Bresenham's line algorithm with a callback between going horizontal and vertical
	x1 = ~~x1; x2 = ~~x2; y1 = ~~y1; y2 = ~~y2;

	const dx = Math.abs(x2 - x1);
	const dy = Math.abs(y2 - y1);
	const sx = (x1 < x2) ? 1 : -1;
	const sy = (y1 < y2) ? 1 : -1;
	let err = dx - dy;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		callback(x1, y1);

		if (x1 === x2 && y1 === y2) break;
		const e2 = err * 2;
		if (e2 > -dy) { err -= dy; x1 += sx; }
		callback(x1, y1);
		if (e2 < dx) { err += dx; y1 += sy; }
	}
}

function draw_fill_without_pattern_support(ctx, start_x, start_y, fill_r, fill_g, fill_b, fill_a) {

	// @TODO: split up processing in case it takes too long?
	// progress bar and abort button (outside of image-manipulation.js)
	// or at least just free up the main thread every once in a while
	// @TODO: speed up with typed arrays? https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
	// could avoid endianness issues if only copying colors
	// the jsperf only shows ~15% improvement
	// maybe do something fancier like special-casing large chunks of single-color image
	// (octree? or just have a higher level stack of chunks to fill and check at if a chunk is homogeneous)

	const c_width = main_canvas.width;
	const c_height = main_canvas.height;
	start_x = Math.max(0, Math.min(Math.floor(start_x), c_width));
	start_y = Math.max(0, Math.min(Math.floor(start_y), c_height));
	const stack = [[start_x, start_y]];
	const id = ctx.getImageData(0, 0, c_width, c_height);
	let pixel_pos = (start_y * c_width + start_x) * 4;
	const start_r = id.data[pixel_pos + 0];
	const start_g = id.data[pixel_pos + 1];
	const start_b = id.data[pixel_pos + 2];
	const start_a = id.data[pixel_pos + 3];

	// @TODO: Allow flood-filling colors similar within fill threshold.
	// Right now it will cause an infinite loop if we don't stop early in this case.
	// As of writing, the fill threshold is very low, so this problem is unlikely to be noticed,
	// but it would be nice as a user-configurable option.
	if (
		Math.abs(fill_r - start_r) <= fill_threshold &&
		Math.abs(fill_g - start_g) <= fill_threshold &&
		Math.abs(fill_b - start_b) <= fill_threshold &&
		Math.abs(fill_a - start_a) <= fill_threshold
	) {
		return;
	}

	while (stack.length) {
		let new_pos;
		let x;
		let y;
		let reach_left;
		let reach_right;
		new_pos = stack.pop();
		x = new_pos[0];
		y = new_pos[1];

		pixel_pos = (y * c_width + x) * 4;
		while (should_fill_at(pixel_pos)) {
			y--;
			pixel_pos = (y * c_width + x) * 4;
		}
		reach_left = false;
		reach_right = false;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			y++;
			pixel_pos = (y * c_width + x) * 4;

			if (!(y < c_height && should_fill_at(pixel_pos))) {
				break;
			}

			do_fill_at(pixel_pos);

			if (x > 0) {
				if (should_fill_at(pixel_pos - 4)) {
					if (!reach_left) {
						stack.push([x - 1, y]);
						reach_left = true;
					}
				} else if (reach_left) {
					reach_left = false;
				}
			}

			if (x < c_width - 1) {
				if (should_fill_at(pixel_pos + 4)) {
					if (!reach_right) {
						stack.push([x + 1, y]);
						reach_right = true;
					}
				} else if (reach_right) {
					reach_right = false;
				}
			}

			pixel_pos += c_width * 4;
		}
	}
	ctx.putImageData(id, 0, 0);

	function should_fill_at(pixel_pos) {
		return (
			// matches start color (i.e. region to fill)
			Math.abs(id.data[pixel_pos + 0] - start_r) <= fill_threshold &&
			Math.abs(id.data[pixel_pos + 1] - start_g) <= fill_threshold &&
			Math.abs(id.data[pixel_pos + 2] - start_b) <= fill_threshold &&
			Math.abs(id.data[pixel_pos + 3] - start_a) <= fill_threshold
		);
	}

	function do_fill_at(pixel_pos) {
		id.data[pixel_pos + 0] = fill_r;
		id.data[pixel_pos + 1] = fill_g;
		id.data[pixel_pos + 2] = fill_b;
		id.data[pixel_pos + 3] = fill_a;
	}
}

function draw_fill(ctx, start_x, start_y, swatch) {
	if (typeof swatch === "string") {
		const fill_rgba = get_rgba_from_color(swatch);
		draw_fill_without_pattern_support(ctx, start_x, start_y, fill_rgba[0], fill_rgba[1], fill_rgba[2], fill_rgba[3]);
	} else {
		const source_canvas = ctx.canvas;
		const fill_canvas = make_canvas(source_canvas.width, source_canvas.height);
		draw_fill_separately(source_canvas.ctx, fill_canvas.ctx, start_x, start_y, 255, 255, 255, 255);
		replace_colors_with_swatch(fill_canvas.ctx, swatch, 0, 0);
		ctx.drawImage(fill_canvas, 0, 0);
	}
}

function draw_fill_separately(source_ctx, dest_ctx, start_x, start_y, fill_r, fill_g, fill_b, fill_a) {
	if (fill_a === 0) {
		throw new Error("Filling with alpha of zero is not supported. Zero alpha is used for detecting whether a pixel has been visited.");
	}
	const c_width = main_canvas.width;
	const c_height = main_canvas.height;
	start_x = Math.max(0, Math.min(Math.floor(start_x), c_width));
	start_y = Math.max(0, Math.min(Math.floor(start_y), c_height));
	const stack = [[start_x, start_y]];
	const source_id = source_ctx.getImageData(0, 0, c_width, c_height);
	const dest_id = dest_ctx.getImageData(0, 0, c_width, c_height);
	let pixel_pos = (start_y * c_width + start_x) * 4;
	const start_r = source_id.data[pixel_pos + 0];
	const start_g = source_id.data[pixel_pos + 1];
	const start_b = source_id.data[pixel_pos + 2];
	const start_a = source_id.data[pixel_pos + 3];

	while (stack.length) {
		let new_pos;
		let x;
		let y;
		let reach_left;
		let reach_right;
		new_pos = stack.pop();
		x = new_pos[0];
		y = new_pos[1];

		pixel_pos = (y * c_width + x) * 4;
		while (should_fill_at(pixel_pos)) {
			y--;
			pixel_pos = (y * c_width + x) * 4;
		}
		reach_left = false;
		reach_right = false;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			y++;
			pixel_pos = (y * c_width + x) * 4;

			if (!(y < c_height && should_fill_at(pixel_pos))) {
				break;
			}

			do_fill_at(pixel_pos);

			if (x > 0) {
				if (should_fill_at(pixel_pos - 4)) {
					if (!reach_left) {
						stack.push([x - 1, y]);
						reach_left = true;
					}
				} else if (reach_left) {
					reach_left = false;
				}
			}

			if (x < c_width - 1) {
				if (should_fill_at(pixel_pos + 4)) {
					if (!reach_right) {
						stack.push([x + 1, y]);
						reach_right = true;
					}
				} else if (reach_right) {
					reach_right = false;
				}
			}

			pixel_pos += c_width * 4;
		}
	}
	dest_ctx.putImageData(dest_id, 0, 0);

	function should_fill_at(pixel_pos) {
		return (
			// not reached yet
			dest_id.data[pixel_pos + 3] === 0 &&
			// and matches start color (i.e. region to fill)
			(
				Math.abs(source_id.data[pixel_pos + 0] - start_r) <= fill_threshold &&
				Math.abs(source_id.data[pixel_pos + 1] - start_g) <= fill_threshold &&
				Math.abs(source_id.data[pixel_pos + 2] - start_b) <= fill_threshold &&
				Math.abs(source_id.data[pixel_pos + 3] - start_a) <= fill_threshold
			)
		);
	}

	function do_fill_at(pixel_pos) {
		dest_id.data[pixel_pos + 0] = fill_r;
		dest_id.data[pixel_pos + 1] = fill_g;
		dest_id.data[pixel_pos + 2] = fill_b;
		dest_id.data[pixel_pos + 3] = fill_a;
	}
}

function replace_color_globally(image_data, from_r, from_g, from_b, from_a, to_r, to_g, to_b, to_a) {
	if (
		from_r === to_r &&
		from_g === to_g &&
		from_b === to_b &&
		from_a === to_a
	) {
		return;
	}
	const { data } = image_data;
	for (let i = 0; i < data.length; i += 4) {
		if (
			Math.abs(data[i + 0] - from_r) <= fill_threshold &&
			Math.abs(data[i + 1] - from_g) <= fill_threshold &&
			Math.abs(data[i + 2] - from_b) <= fill_threshold &&
			Math.abs(data[i + 3] - from_a) <= fill_threshold
		) {
			data[i + 0] = to_r;
			data[i + 1] = to_g;
			data[i + 2] = to_b;
			data[i + 3] = to_a;
		}
	}
}

function find_color_globally(source_image_data, dest_image_data, find_r, find_g, find_b, find_a) {
	const source_data = source_image_data.data;
	const dest_data = dest_image_data.data;
	for (let i = 0; i < source_data.length; i += 4) {
		if (
			Math.abs(source_data[i + 0] - find_r) <= fill_threshold &&
			Math.abs(source_data[i + 1] - find_g) <= fill_threshold &&
			Math.abs(source_data[i + 2] - find_b) <= fill_threshold &&
			Math.abs(source_data[i + 3] - find_a) <= fill_threshold
		) {
			dest_data[i + 0] = 255;
			dest_data[i + 1] = 255;
			dest_data[i + 2] = 255;
			dest_data[i + 3] = 255;
		}
	}
}

function draw_noncontiguous_fill_without_pattern_support(ctx, x, y, fill_r, fill_g, fill_b, fill_a) {
	x = Math.max(0, Math.min(Math.floor(x), ctx.canvas.width));
	y = Math.max(0, Math.min(Math.floor(y), ctx.canvas.height));
	const image_data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	const start_index = (y * image_data.width + x) * 4;
	const start_r = image_data.data[start_index + 0];
	const start_g = image_data.data[start_index + 1];
	const start_b = image_data.data[start_index + 2];
	const start_a = image_data.data[start_index + 3];

	replace_color_globally(image_data, start_r, start_g, start_b, start_a, fill_r, fill_g, fill_b, fill_a);

	ctx.putImageData(image_data, 0, 0);
}

function draw_noncontiguous_fill(ctx, x, y, swatch) {
	if (typeof swatch === "string") {
		const fill_rgba = get_rgba_from_color(swatch);
		draw_noncontiguous_fill_without_pattern_support(ctx, x, y, fill_rgba[0], fill_rgba[1], fill_rgba[2], fill_rgba[3]);
	} else {
		const source_canvas = ctx.canvas;
		const fill_canvas = make_canvas(source_canvas.width, source_canvas.height);
		draw_noncontiguous_fill_separately(source_canvas.ctx, fill_canvas.ctx, x, y);
		replace_colors_with_swatch(fill_canvas.ctx, swatch, 0, 0);
		ctx.drawImage(fill_canvas, 0, 0);
	}
}

function draw_noncontiguous_fill_separately(source_ctx, dest_ctx, x, y) {
	x = Math.max(0, Math.min(Math.floor(x), source_ctx.canvas.width));
	y = Math.max(0, Math.min(Math.floor(y), source_ctx.canvas.height));
	const source_image_data = source_ctx.getImageData(0, 0, source_ctx.canvas.width, source_ctx.canvas.height);
	const dest_image_data = dest_ctx.getImageData(0, 0, dest_ctx.canvas.width, dest_ctx.canvas.height);
	const start_index = (y * source_image_data.width + x) * 4;
	const start_r = source_image_data.data[start_index + 0];
	const start_g = source_image_data.data[start_index + 1];
	const start_b = source_image_data.data[start_index + 2];
	const start_a = source_image_data.data[start_index + 3];

	find_color_globally(source_image_data, dest_image_data, start_r, start_g, start_b, start_a);

	dest_ctx.putImageData(dest_image_data, 0, 0);
}

function apply_image_transformation(meta, fn) {
	// Apply an image transformation function to either the selection or the entire canvas
	const original_canvas = selection ? selection.source_canvas : main_canvas;

	const new_canvas = make_canvas(original_canvas.width, original_canvas.height);

	const original_ctx = original_canvas.getContext("2d");
	const new_ctx = new_canvas.getContext("2d");

	fn(original_canvas, original_ctx, new_canvas, new_ctx);

	if (selection) {
		undoable({
			name: `${meta.name} (${localize("Selection")})`,
			icon: meta.icon,
			soft: true,
		}, () => {
			selection.replace_source_canvas(new_canvas);
		});
	} else {
		deselect();
		cancel();
		undoable({
			name: meta.name,
			icon: meta.icon,
		}, () => {
			saved = false;
			update_title();

			main_ctx.copy(new_canvas);

			$canvas.trigger("update"); // update handles
		});
	}
}

function flip_horizontal() {
	apply_image_transformation({
		name: localize("Flip horizontal"),
		icon: get_help_folder_icon("p_fliph.png"),
	}, (original_canvas, original_ctx, new_canvas, new_ctx) => {
		new_ctx.translate(new_canvas.width, 0);
		new_ctx.scale(-1, 1);
		new_ctx.drawImage(original_canvas, 0, 0);
	});
}

function flip_vertical() {
	apply_image_transformation({
		name: localize("Flip vertical"),
		icon: get_help_folder_icon("p_flipv.png"),
	}, (original_canvas, original_ctx, new_canvas, new_ctx) => {
		new_ctx.translate(0, new_canvas.height);
		new_ctx.scale(1, -1);
		new_ctx.drawImage(original_canvas, 0, 0);
	});
}

function rotate(angle) {
	apply_image_transformation({
		name: `${localize("Rotate by angle")} ${angle / TAU * 360} ${localize("Degrees")}`,
		icon: get_help_folder_icon(`p_rotate_${angle >= 0 ? "cw" : "ccw"}.png`),
	}, (original_canvas, original_ctx, new_canvas, new_ctx) => {
		new_ctx.save();
		switch (angle) {
			case TAU / 4:
			case TAU * -3 / 4:
				new_canvas.width = original_canvas.height;
				new_canvas.height = original_canvas.width;
				new_ctx.disable_image_smoothing();
				new_ctx.translate(new_canvas.width, 0);
				new_ctx.rotate(TAU / 4);
				break;
			case TAU / 2:
			case TAU / -2:
				new_ctx.translate(new_canvas.width, new_canvas.height);
				new_ctx.rotate(TAU / 2);
				break;
			case TAU * 3 / 4:
			case TAU / -4:
				new_canvas.width = original_canvas.height;
				new_canvas.height = original_canvas.width;
				new_ctx.disable_image_smoothing();
				new_ctx.translate(0, new_canvas.height);
				new_ctx.rotate(TAU / -4);
				break;
			default: {
				const w = original_canvas.width;
				const h = original_canvas.height;

				let bb_min_x = +Infinity;
				let bb_max_x = -Infinity;
				let bb_min_y = +Infinity;
				let bb_max_y = -Infinity;
				const corner = (x01, y01) => {
					const x = Math.sin(-angle) * h * x01 + Math.cos(+angle) * w * y01;
					const y = Math.sin(+angle) * w * y01 + Math.cos(-angle) * h * x01;
					bb_min_x = Math.min(bb_min_x, x);
					bb_max_x = Math.max(bb_max_x, x);
					bb_min_y = Math.min(bb_min_y, y);
					bb_max_y = Math.max(bb_max_y, y);
				};

				corner(0, 0);
				corner(0, 1);
				corner(1, 0);
				corner(1, 1);

				const bb_x = bb_min_x;
				const bb_y = bb_min_y;
				const bb_w = bb_max_x - bb_min_x;
				const bb_h = bb_max_y - bb_min_y;

				new_canvas.width = bb_w;
				new_canvas.height = bb_h;
				new_ctx.disable_image_smoothing();

				if (!transparency) {
					new_ctx.fillStyle = selected_colors.background;
					new_ctx.fillRect(0, 0, new_canvas.width, new_canvas.height);
				}

				new_ctx.translate(-bb_x, -bb_y);
				new_ctx.rotate(angle);
				new_ctx.drawImage(original_canvas, 0, 0, w, h);
				break;
			}
		}
		new_ctx.drawImage(original_canvas, 0, 0);
		new_ctx.restore();
	});
}

function stretch_and_skew(x_scale, y_scale, h_skew, v_skew) {
	apply_image_transformation({
		name:
			(h_skew !== 0 || v_skew !== 0) ? (
				(x_scale !== 1 || y_scale !== 1) ? localize("Stretch and Skew") : localize("Skew")
			) : localize("Stretch"),
		icon: get_help_folder_icon(
			(h_skew !== 0) ? "p_skew_h.png" :
				(v_skew !== 0) ? "p_skew_v.png" :
					(y_scale !== 1) ? (
						(x_scale !== 1) ? "p_stretch_both.png" : "p_stretch_v.png"
					) : "p_stretch_h.png"
		),
	}, (original_canvas, original_ctx, new_canvas, new_ctx) => {
		const w = original_canvas.width * x_scale;
		const h = original_canvas.height * y_scale;

		let bb_min_x = +Infinity;
		let bb_max_x = -Infinity;
		let bb_min_y = +Infinity;
		let bb_max_y = -Infinity;
		const corner = (x01, y01) => {
			const x = Math.tan(h_skew) * h * x01 + w * y01;
			const y = Math.tan(v_skew) * w * y01 + h * x01;
			bb_min_x = Math.min(bb_min_x, x);
			bb_max_x = Math.max(bb_max_x, x);
			bb_min_y = Math.min(bb_min_y, y);
			bb_max_y = Math.max(bb_max_y, y);
		};

		corner(0, 0);
		corner(0, 1);
		corner(1, 0);
		corner(1, 1);

		const bb_x = bb_min_x;
		const bb_y = bb_min_y;
		const bb_w = bb_max_x - bb_min_x;
		const bb_h = bb_max_y - bb_min_y;

		new_canvas.width = Math.max(1, bb_w);
		new_canvas.height = Math.max(1, bb_h);
		new_ctx.disable_image_smoothing();

		if (!transparency) {
			new_ctx.fillStyle = selected_colors.background;
			new_ctx.fillRect(0, 0, new_canvas.width, new_canvas.height);
		}

		new_ctx.save();
		new_ctx.transform(
			1, // x scale
			Math.tan(v_skew), // vertical skew (skewY)
			Math.tan(h_skew), // horizontal skew (skewX)
			1, // y scale
			-bb_x, // x translation
			-bb_y // y translation
		);
		new_ctx.drawImage(original_canvas, 0, 0, w, h);
		new_ctx.restore();
	});
}

function invert_rgb(source_ctx, dest_ctx = source_ctx) {
	const image_data = source_ctx.getImageData(0, 0, source_ctx.canvas.width, source_ctx.canvas.height);
	for (let i = 0; i < image_data.data.length; i += 4) {
		image_data.data[i + 0] = 255 - image_data.data[i + 0];
		image_data.data[i + 1] = 255 - image_data.data[i + 1];
		image_data.data[i + 2] = 255 - image_data.data[i + 2];
	}
	dest_ctx.putImageData(image_data, 0, 0);
}

function invert_monochrome(source_ctx, dest_ctx = source_ctx, monochrome_info = detect_monochrome(source_ctx)) {
	const image_data = source_ctx.getImageData(0, 0, source_ctx.canvas.width, source_ctx.canvas.height);
	// Note: values in pixel_array may be different on big endian vs little endian machines.
	// Only rely on equality of values within the array.
	// pixel_array is a performance optimization, to access whole pixels at a time instead of individual color channels.
	const pixel_array = new Uint32Array(image_data.data.buffer);
	if (monochrome_info.presentNonTransparentUint32s.length === 0) {
		// Fully transparent.
		// No change, and no need to copy the image to dest canvas to represent that lack of a change.
		return;
	}
	if (monochrome_info.presentNonTransparentUint32s.length === 1) {
		// Only one non-transparent color present in the image.
		// Can't use just the information of what colors are in the canvas to invert, need to look at the palette.
		// We could've done this in a unified way, but whatever!
		// Personally, I think this is a CHARMINGLY poor solution.
		// Maybe a little less so now that I added handling for transparency (i.e. Free-Form Select).
		const color_1 = palette[0];
		const color_2 = palette[14] || palette[1];
		const color_1_rgba = get_rgba_from_color(color_1);
		const present_rgba = monochrome_info.presentNonTransparentRGBAs[0];
		if (
			present_rgba[0] === color_1_rgba[0] &&
			present_rgba[1] === color_1_rgba[1] &&
			present_rgba[2] === color_1_rgba[2] &&
			present_rgba[3] === color_1_rgba[3]
		) {
			dest_ctx.fillStyle = color_2;
		} else {
			dest_ctx.fillStyle = color_1;
		}
		if (monochrome_info.monochromeWithTransparency) {
			dest_ctx.putImageData(image_data, 0, 0);
			dest_ctx.globalCompositeOperation = "source-in";
		}
		dest_ctx.fillRect(0, 0, source_ctx.canvas.width, source_ctx.canvas.height);
		return;
	}
	const [uint32_a, uint32_b] = monochrome_info.presentNonTransparentUint32s;
	for (let i = 0, len = pixel_array.length; i < len; i += 1) {
		if (pixel_array[i] === uint32_a) {
			pixel_array[i] = uint32_b;
		} else if (pixel_array[i] === uint32_b) {
			pixel_array[i] = uint32_a;
		}
	}
	dest_ctx.putImageData(image_data, 0, 0);
}

function threshold_black_and_white(ctx, threshold) {
	const image_data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	for (let i = 0; i < image_data.data.length; i += 4) {
		const white = (image_data.data[i + 0] + image_data.data[i + 1] + image_data.data[i + 2]) / 3 / 255 > threshold;
		image_data.data[i + 0] = 255 * white;
		image_data.data[i + 1] = 255 * white;
		image_data.data[i + 2] = 255 * white;
		image_data.data[i + 3] = 255;
	}
	ctx.putImageData(image_data, 0, 0);
}

function replace_colors_with_swatch(ctx, swatch, x_offset_from_global_canvas = 0, y_offset_from_global_canvas = 0) {
	// USAGE NOTE: Context MUST be untranslated! (for the rectangle to cover the exact area of the canvas, and presumably for the pattern alignment as well)
	// This function is mainly for patterns support (for black & white mode) but naturally handles solid colors as well.
	ctx.globalCompositeOperation = "source-in";
	ctx.fillStyle = swatch;
	ctx.beginPath();
	ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.save();
	ctx.translate(-x_offset_from_global_canvas, -y_offset_from_global_canvas);
	ctx.fill();
	ctx.restore();
}

// adapted from https://github.com/Pomax/bezierjs
function compute_bezier(t, start_x, start_y, control_1_x, control_1_y, control_2_x, control_2_y, end_x, end_y) {
	const mt = 1 - t;
	const mt2 = mt * mt;
	const t2 = t * t;
	let a, b, c, d = 0;

	a = mt2 * mt;
	b = mt2 * t * 3;
	c = mt * t2 * 3;
	d = t * t2;

	return {
		x: a * start_x + b * control_1_x + c * control_2_x + d * end_x,
		y: a * start_y + b * control_1_y + c * control_2_y + d * end_y
	};
}

function draw_bezier_curve_without_pattern_support(ctx, start_x, start_y, control_1_x, control_1_y, control_2_x, control_2_y, end_x, end_y, stroke_size) {
	const steps = 100;
	let point_a = { x: start_x, y: start_y };
	for (let t = 0; t < 1; t += 1 / steps) {
		const point_b = compute_bezier(t, start_x, start_y, control_1_x, control_1_y, control_2_x, control_2_y, end_x, end_y);
		// @TODO: carry "error" from Bresenham line algorithm between iterations? and/or get a proper Bezier drawing algorithm
		draw_line_without_pattern_support(ctx, point_a.x, point_a.y, point_b.x, point_b.y, stroke_size);
		point_a = point_b;
	}
}
function draw_quadratic_curve(ctx, start_x, start_y, control_x, control_y, end_x, end_y, stroke_size) {
	draw_bezier_curve(ctx, start_x, start_y, control_x, control_y, control_x, control_y, end_x, end_y, stroke_size);
}

function draw_bezier_curve(ctx, start_x, start_y, control_1_x, control_1_y, control_2_x, control_2_y, end_x, end_y, stroke_size) {
	// could calculate bounds of Bezier curve with something like bezier-js
	// but just using the control points should be fine
	const min_x = Math.min(start_x, control_1_x, control_2_x, end_x);
	const min_y = Math.min(start_y, control_1_y, control_2_y, end_y);
	const max_x = Math.max(start_x, control_1_x, control_2_x, end_x);
	const max_y = Math.max(start_y, control_1_y, control_2_y, end_y);
	draw_with_swatch(ctx, min_x, min_y, max_x, max_y, stroke_color, op_ctx_2d => {
		draw_bezier_curve_without_pattern_support(op_ctx_2d, start_x, start_y, control_1_x, control_1_y, control_2_x, control_2_y, end_x, end_y, stroke_size);
	});
}
function draw_line(ctx, x1, y1, x2, y2, stroke_size) {
	const min_x = Math.min(x1, x2);
	const min_y = Math.min(y1, y2);
	const max_x = Math.max(x1, x2);
	const max_y = Math.max(y1, y2);
	draw_with_swatch(ctx, min_x, min_y, max_x, max_y, stroke_color, op_ctx_2d => {
		draw_line_without_pattern_support(op_ctx_2d, x1, y1, x2, y2, stroke_size);
	});
	// also works:
	// draw_line_strip(ctx, [{ x: x1, y: y1 }, { x: x2, y: y2 }]);
}

let grid_pattern;
function draw_grid(ctx, scale) {
	const pattern_size = Math.floor(scale); // @TODO: try ceil too
	if (!grid_pattern || grid_pattern.width !== pattern_size || grid_pattern.height !== pattern_size) {
		const grid_pattern_canvas = make_canvas(pattern_size, pattern_size);
		const dark_gray = "#808080";
		const light_gray = "#c0c0c0";
		grid_pattern_canvas.ctx.fillStyle = dark_gray;
		grid_pattern_canvas.ctx.fillRect(0, 0, 1, pattern_size);
		grid_pattern_canvas.ctx.fillStyle = dark_gray;
		grid_pattern_canvas.ctx.fillRect(0, 0, pattern_size, 1);
		grid_pattern_canvas.ctx.fillStyle = light_gray;
		for (let i = 1; i < pattern_size; i += 2) {
			grid_pattern_canvas.ctx.fillRect(i, 0, 1, 1);
			grid_pattern_canvas.ctx.fillRect(0, i, 1, 1);
		}
		grid_pattern = ctx.createPattern(grid_pattern_canvas, "repeat");
	}
	ctx.save();
	ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
	if (scale !== pattern_size) {
		ctx.translate(-0.5, -0.75); // hand picked to look "good" at 110% in chrome
		// might be better to just hide the grid in some more cases tho
		// ...@TODO: if I can get helper layer to be pixel aligned, I can probably remove this
	}
	ctx.scale(scale / pattern_size, scale / pattern_size);
	ctx.enable_image_smoothing();
	ctx.fillStyle = grid_pattern;
	ctx.fill();
	ctx.restore();
}

(() => {

	// the dashes of the border are sized such that at 4x zoom,
	// they're squares equal to one canvas pixel
	// they're offset by a screen pixel tho from the canvas pixel cells

	const svg_for_creating_matrices = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	const horizontal_pattern_canvas = make_canvas(8, 4);
	const vertical_pattern_canvas = make_canvas(4, 8);
	let horizontal_pattern;
	let vertical_pattern;

	function draw_dashes(ctx, x, y, go_x, go_y, scale, translate_x, translate_y) {
		if (!vertical_pattern) {
			horizontal_pattern_canvas.ctx.fillStyle = "white";
			horizontal_pattern_canvas.ctx.fillRect(4, 0, 4, 4);
			vertical_pattern_canvas.ctx.fillStyle = "white";
			vertical_pattern_canvas.ctx.fillRect(0, 4, 4, 4);
			horizontal_pattern = ctx.createPattern(horizontal_pattern_canvas, "repeat");
			vertical_pattern = ctx.createPattern(vertical_pattern_canvas, "repeat");
		}

		const dash_width = 1;
		const hairline_width = 1 / scale; // size of a screen pixel

		ctx.save();

		ctx.scale(scale, scale);
		ctx.translate(translate_x, translate_y);

		ctx.translate(x, y);
		ctx.globalCompositeOperation = "difference";


		if (go_x > 0) {
			const matrix = svg_for_creating_matrices.createSVGMatrix();
			if (horizontal_pattern.setTransform) { // not supported by Edge as of 2019-12-04
				horizontal_pattern.setTransform(matrix.translate(-x, -y).translate(hairline_width, 0).scale(1 / scale));
			}
			ctx.fillStyle = horizontal_pattern;
			ctx.fillRect(0, 0, go_x, dash_width);
		} else if (go_y > 0) {
			const matrix = svg_for_creating_matrices.createSVGMatrix();
			if (vertical_pattern.setTransform) { // not supported by Edge as of 2019-12-04
				vertical_pattern.setTransform(matrix.translate(-x, -y).translate(0, hairline_width).scale(1 / scale));
			}
			ctx.fillStyle = vertical_pattern;
			ctx.fillRect(0, 0, dash_width, go_y);
		}
		ctx.restore();
	}

	window.draw_selection_box = (ctx, rect_x, rect_y, rect_w, rect_h, scale, translate_x, translate_y) => {
		draw_dashes(ctx, rect_x, rect_y, rect_w - 1, 0, scale, translate_x, translate_y); // top
		if (rect_h === 1) {
			draw_dashes(ctx, rect_x, rect_y, 0, 1, scale, translate_x, translate_y); // left
		} else {
			draw_dashes(ctx, rect_x, rect_y + 1, 0, rect_h - 2, scale, translate_x, translate_y); // left
		}
		draw_dashes(ctx, rect_x + rect_w - 1, rect_y, 0, rect_h, scale, translate_x, translate_y); // right
		draw_dashes(ctx, rect_x, rect_y + rect_h - 1, rect_w - 1, 0, scale, translate_x, translate_y); // bottom
		draw_dashes(ctx, rect_x, rect_y + 1, 0, 1, scale, translate_x, translate_y); // top left dangling bit???
	};

})();

(() => {

	const tessy = (function initTesselator() {
		// function called for each vertex of tesselator output
		function vertex_callback(data, poly_vert_array) {
			// window.console && console.log(data[0], data[1]);
			poly_vert_array[poly_vert_array.length] = data[0];
			poly_vert_array[poly_vert_array.length] = data[1];
		}
		function begin_callback(type) {
			if (type !== libtess.primitiveType.GL_TRIANGLES) {
				window.console && console.log(`Expected TRIANGLES but got type: ${type}`);
			}
		}
		function error_callback(errno) {
			window.console && console.log('error callback');
			window.console && console.log(`error number: ${errno}`);
		}
		// callback for when segments intersect and must be split
		function combine_callback(coords/*, data, weight*/) {
			// window.console && console.log('combine callback');
			return [coords[0], coords[1], coords[2]];
		}
		function edge_callback(/*flag*/) {
			// don't really care about the flag, but need no-strip/no-fan behavior
			// window.console && console.log('edge flag: ' + flag);
		}

		const tessy = new libtess.GluTesselator();
		// tessy.gluTessProperty(libtess.gluEnum.GLU_TESS_WINDING_RULE, libtess.windingRule.GLU_TESS_WINDING_POSITIVE);
		tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertex_callback);
		tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_BEGIN, begin_callback);
		tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_ERROR, error_callback);
		tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combine_callback);
		tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edge_callback);

		return tessy;
	}());

	function triangulate(contours) {
		// libtess will take 3d verts and flatten to a plane for tesselation
		// since only doing 2d tesselation here, provide z=1 normal to skip
		// iterating over verts only to get the same answer.
		tessy.gluTessNormal(0, 0, 1);

		const triangleVerts = [];
		tessy.gluTessBeginPolygon(triangleVerts);

		for (let i = 0; i < contours.length; i++) {
			tessy.gluTessBeginContour();
			const contour = contours[i];
			for (let j = 0; j < contour.length; j += 2) {
				const coords = [contour[j], contour[j + 1], 0];
				tessy.gluTessVertex(coords, coords);
			}
			tessy.gluTessEndContour();
		}

		tessy.gluTessEndPolygon();

		return triangleVerts;
	}


	let gl;
	let positionLoc;

	function initWebGL(canvas) {
		try {
			gl = canvas.getContext('webgl', { antialias: false });
		} catch (error) {
			show_error_message("Failed to get WebGL context. You may need to refresh the web page, or restart your computer.", error);
			return;
		}

		if (!gl) {
			show_error_message("Failed to get WebGL context. You may need to refresh the web page, or restart your computer.");
			return;
		}

		window.WEBGL_lose_context = gl.getExtension("WEBGL_lose_context");

		const program = createShaderProgram();
		positionLoc = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(positionLoc);
	}

	function initArrayBuffer(triangleVertexCoords) {
		// put triangle coordinates into a WebGL ArrayBuffer and bind to
		// shader's 'position' attribute variable
		const rawData = new Float32Array(triangleVertexCoords);
		const polygonArrayBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, polygonArrayBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, rawData, gl.STATIC_DRAW);
		gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

		return triangleVertexCoords.length / 2;
	}

	function createShaderProgram() {
		// create vertex shader
		const vertexSrc = [
			'attribute vec4 position;',
			'void main() {',
			'	/* already in normalized coordinates, so just pass through */',
			'	gl_Position = position;',
			'}'
		].join('');
		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexSrc);
		gl.compileShader(vertexShader);

		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			window.console && console.log(
				`Vertex shader failed to compile. Log: ${gl.getShaderInfoLog(vertexShader)}`
			);
		}

		// create fragment shader
		const fragmentSrc = [
			'precision mediump float;',
			'void main() {',
			'	gl_FragColor = vec4(0, 0, 0, 1);',
			'}'
		].join('');
		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentSrc);
		gl.compileShader(fragmentShader);

		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			window.console && console.log(
				`Fragment shader failed to compile. Log: ${gl.getShaderInfoLog(fragmentShader)}`
			);
		}

		// link shaders to create our program
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		gl.useProgram(program);

		return program;
	}


	const op_canvas_webgl = document.createElement('canvas');
	const op_canvas_2d = document.createElement('canvas');
	const op_ctx_2d = op_canvas_2d.getContext("2d");

	initWebGL(op_canvas_webgl);
	let warning_tid;
	op_canvas_webgl.addEventListener("webglcontextlost", (e) => {
		e.preventDefault();
		window.console && console.warn("WebGL context lost");
		clamp_brush_sizes();

		warning_tid = setTimeout(() => {
			show_error_message("The WebGL context was lost. You may need to refresh the web page, or restart your computer.");
		}, 3000);
	}, false);
	op_canvas_webgl.addEventListener("webglcontextrestored", () => {
		initWebGL(op_canvas_webgl);

		window.console && console.warn("WebGL context restored");
		clearTimeout(warning_tid);

		clamp_brush_sizes();

		// brushes rendered using WebGL may be invalid (i.e. invisible) since the context was lost
		// invalidate the cache(s) so that brushes will be re-rendered now that WebGL is restored
		$G.triggerHandler("invalidate-brush-canvases");

		$G.triggerHandler("redraw-tool-options-because-webglcontextrestored");
	}, false);

	function clamp_brush_sizes() {
		const max_size = 100;
		if (brush_size > max_size) {
			brush_size = max_size;
			show_error_message(`Brush size clamped to ${max_size}`);
		}
		if (pencil_size > max_size) {
			pencil_size = max_size;
			show_error_message(`Pencil size clamped to ${max_size}`);
		}
		if (stroke_size > max_size) {
			stroke_size = max_size;
			show_error_message(`Stroke size clamped to ${max_size}`);
		}
	}

	window.draw_line_strip = (ctx, points) => {
		draw_polygon_or_line_strip(ctx, points, true, false, false);
	};
	window.draw_polygon = (ctx, points, stroke, fill) => {
		draw_polygon_or_line_strip(ctx, points, stroke, fill, true);
	};

	function draw_polygon_or_line_strip(ctx, points, stroke, fill, close_path) {
		if (!gl) {
			show_error_message("Failed to get WebGL context. You may need to refresh the web page, or restart your computer.");
			return; // @TODO: don't pollute brush cache with empty brushes (also maybe fallback to 2D canvas rendering)
		}

		// this must be before stuff is done with op_canvas
		// otherwise update_brush_for_drawing_lines calls render_brush calls draw_ellipse calls draw_polygon calls draw_polygon_or_line_strip
		// trying to use the same op_canvas
		// (also, avoiding infinite recursion by checking for stroke; assuming brushes will never have outlines)
		if (stroke && stroke_size > 1) {
			update_brush_for_drawing_lines(stroke_size);
		}

		const stroke_color = ctx.strokeStyle;
		const fill_color = ctx.fillStyle;

		const numPoints = points.length;
		const numCoords = numPoints * 2;

		if (numPoints === 0) {
			return;
		}

		let x_min = +Infinity;
		let x_max = -Infinity;
		let y_min = +Infinity;
		let y_max = -Infinity;
		for (const { x, y } of points) {
			x_min = Math.min(x, x_min);
			x_max = Math.max(x, x_max);
			y_min = Math.min(y, y_min);
			y_max = Math.max(y, y_max);
		}
		x_max += 1;
		y_max += 1;
		x_min -= 1;
		y_min -= 1;

		op_canvas_webgl.width = x_max - x_min;
		op_canvas_webgl.height = y_max - y_min;
		gl.viewport(0, 0, op_canvas_webgl.width, op_canvas_webgl.height);

		const coords = new Float32Array(numCoords);
		for (let i = 0; i < numPoints; i++) {
			coords[i * 2 + 0] = (points[i].x - x_min) / op_canvas_webgl.width * 2 - 1;
			coords[i * 2 + 1] = 1 - (points[i].y - y_min) / op_canvas_webgl.height * 2;
			// @TODO: investigate: does this cause resolution/information loss? can we change the coordinate system?
		}

		if (fill) {
			const contours = [coords];
			const polyTriangles = triangulate(contours);
			let numVertices = initArrayBuffer(polyTriangles);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, numVertices);

			op_canvas_2d.width = op_canvas_webgl.width;
			op_canvas_2d.height = op_canvas_webgl.height;

			op_ctx_2d.drawImage(op_canvas_webgl, 0, 0);
			replace_colors_with_swatch(op_ctx_2d, fill_color, x_min, y_min);
			ctx.drawImage(op_canvas_2d, x_min, y_min);
		}
		if (stroke) {
			if (stroke_size > 1) {
				const stroke_margin = ~~(stroke_size * 1.1);

				const op_canvas_x = x_min - stroke_margin;
				const op_canvas_y = y_min - stroke_margin;

				op_canvas_2d.width = x_max - x_min + stroke_margin * 2;
				op_canvas_2d.height = y_max - y_min + stroke_margin * 2;
				for (let i = 0; i < numPoints - (close_path ? 0 : 1); i++) {
					const point_a = points[i];
					const point_b = points[(i + 1) % numPoints];
					// Note: update_brush_for_drawing_lines way above
					draw_line_without_pattern_support(
						op_ctx_2d,
						point_a.x - op_canvas_x,
						point_a.y - op_canvas_y,
						point_b.x - op_canvas_x,
						point_b.y - op_canvas_y,
						stroke_size
					);
				}

				replace_colors_with_swatch(op_ctx_2d, stroke_color, op_canvas_x, op_canvas_y);
				ctx.drawImage(op_canvas_2d, op_canvas_x, op_canvas_y);
			} else {
				let numVertices = initArrayBuffer(coords);
				gl.clear(gl.COLOR_BUFFER_BIT);
				gl.drawArrays(close_path ? gl.LINE_LOOP : gl.LINE_STRIP, 0, numVertices);

				op_canvas_2d.width = op_canvas_webgl.width;
				op_canvas_2d.height = op_canvas_webgl.height;

				op_ctx_2d.drawImage(op_canvas_webgl, 0, 0);
				replace_colors_with_swatch(op_ctx_2d, stroke_color, x_min, y_min);
				ctx.drawImage(op_canvas_2d, x_min, y_min);
			}
		}
	}

	window.copy_contents_within_polygon = (canvas, points, x_min, y_min, x_max, y_max) => {
		// Copy the contents of the given canvas within the polygon given by points bounded by x/y_min/max
		x_max = Math.max(x_max, x_min + 1);
		y_max = Math.max(y_max, y_min + 1);
		const width = x_max - x_min;
		const height = y_max - y_min;

		// @TODO: maybe have the cutout only the width/height of the bounds
		// const cutout = make_canvas(width, height);
		const cutout = make_canvas(canvas);

		cutout.ctx.save();
		cutout.ctx.globalCompositeOperation = "destination-in";
		draw_polygon(cutout.ctx, points, false, true);
		cutout.ctx.restore();

		const cutout_crop = make_canvas(width, height);
		cutout_crop.ctx.drawImage(cutout, x_min, y_min, width, height, 0, 0, width, height);

		return cutout_crop;
	}

	// @TODO: maybe shouldn't be external...
	window.draw_with_swatch = (ctx, x_min, y_min, x_max, y_max, swatch, callback) => {
		const stroke_margin = ~~(stroke_size * 1.1);

		x_max = Math.max(x_max, x_min + 1);
		y_max = Math.max(y_max, y_min + 1);
		op_canvas_2d.width = x_max - x_min + stroke_margin * 2;
		op_canvas_2d.height = y_max - y_min + stroke_margin * 2;

		const x = x_min - stroke_margin;
		const y = y_min - stroke_margin;

		op_ctx_2d.save();
		op_ctx_2d.translate(-x, -y);
		callback(op_ctx_2d);
		op_ctx_2d.restore(); // for replace_colors_with_swatch!

		replace_colors_with_swatch(op_ctx_2d, swatch, x, y);
		ctx.drawImage(op_canvas_2d, x, y);

		// for debug:
		// ctx.fillStyle = "rgba(255, 0, 255, 0.1)";
		// ctx.fillRect(x, y, op_canvas_2d.width, op_canvas_2d.height);
	}
})();
