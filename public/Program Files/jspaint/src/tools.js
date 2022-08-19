(() => {

	// This is for linting stuff at the bottom.
	/* eslint no-restricted-syntax: ["error", "ThisExpression"] */
	/* eslint-disable no-restricted-syntax */

	window.TOOL_FREE_FORM_SELECT = "TOOL_FREE_FORM_SELECT";
	window.TOOL_SELECT = "TOOL_SELECT";
	window.TOOL_ERASER = "TOOL_ERASER";
	window.TOOL_FILL = "TOOL_FILL";
	window.TOOL_PICK_COLOR = "TOOL_PICK_COLOR";
	window.TOOL_MAGNIFIER = "TOOL_MAGNIFIER";
	window.TOOL_PENCIL = "TOOL_PENCIL";
	window.TOOL_BRUSH = "TOOL_BRUSH";
	window.TOOL_AIRBRUSH = "TOOL_AIRBRUSH";
	window.TOOL_TEXT = "TOOL_TEXT";
	window.TOOL_LINE = "TOOL_LINE";
	window.TOOL_CURVE = "TOOL_CURVE";
	window.TOOL_RECTANGLE = "TOOL_RECTANGLE";
	window.TOOL_POLYGON = "TOOL_POLYGON";
	window.TOOL_ELLIPSE = "TOOL_ELLIPSE";
	window.TOOL_ROUNDED_RECTANGLE = "TOOL_ROUNDED_RECTANGLE";

	window.tools = [{
		id: TOOL_FREE_FORM_SELECT,
		name: localize("Free-Form Select"),
		speech_recognition: [
			"lasso", "select with lasso", "select by lassoing", "lassoing",
			"lasso select", "freeform select", "free-form select", "free form select", "polygonal select", "polygon select", "shape select", "outline select", "select by outline", "select by outlining", "star select", "shape select", "select by shape", "select by drawing a shape", "select by drawing shape",
			"lasso selection", "freeform selection", "free-form selection", "free form selection", "polygonal selection", "polygon selection", "shape selection", "outline selection", "selection by outline", "selection by outlining", "star selection", "shape selection", "selection by shape", "selection by drawing a shape", "selection by drawing shape",
			"lasso selecting", "freeform selecting", "free-form selecting", "free form selecting", "polygonal selecting", "polygon selecting", "shape selecting", "outline selecting", "selecting by outline", "selecting by outlining", "star selecting", "shape selecting", "selecting by shape", "selecting by drawing a shape", "selecting by drawing shape",
			"lasso selector", "freeform selector", "free-form selector", "free form selector", "polygonal selector", "polygon selector", "shape selector", "outline selector", "by outline selector", "outlining selector", "star selector", "shape selector", "by shape selector", "by drawing a shape selector", "by drawing shape selector",
		],
		help_icon: "p_free.gif",
		description: localize("Selects a free-form part of the picture to move, copy, or edit."),
		cursor: ["precise", [16, 16], "crosshair"],

		// A canvas for rendering a preview of the shape
		preview_canvas: null,

		// The vertices of the polygon
		points: [],

		// The boundaries of the polygon
		x_min: +Infinity,
		x_max: -Infinity,
		y_min: +Infinity,
		y_max: -Infinity,

		pointerdown() {
			this.x_min = pointer.x;
			this.x_max = pointer.x + 1;
			this.y_min = pointer.y;
			this.y_max = pointer.y + 1;
			this.points = [];
			this.preview_canvas = make_canvas(main_canvas.width, main_canvas.height);

			// End prior selection, drawing it to the canvas
			deselect();
		},
		paint(ctx, x, y) {
			// Constrain the pointer to the canvas
			pointer.x = Math.min(main_canvas.width, pointer.x);
			pointer.x = Math.max(0, pointer.x);
			pointer.y = Math.min(main_canvas.height, pointer.y);
			pointer.y = Math.max(0, pointer.y);
			// Add the point
			this.points.push(pointer);
			// Update the boundaries of the polygon
			this.x_min = Math.min(pointer.x, this.x_min);
			this.x_max = Math.max(pointer.x, this.x_max);
			this.y_min = Math.min(pointer.y, this.y_min);
			this.y_max = Math.max(pointer.y, this.y_max);

			bresenham_line(pointer_previous.x, pointer_previous.y, pointer.x, pointer.y, (x, y) => {
				this.paint_iteration(x, y);
			});
		},
		paint_iteration(x, y) {
			// Constrain the inversion paint brush position to the canvas
			x = Math.min(main_canvas.width, x);
			x = Math.max(0, x);
			y = Math.min(main_canvas.height, y);
			y = Math.max(0, y);

			// Find the dimensions on the canvas of the tiny square to invert
			const inversion_size = 2;
			const rect_x = ~~(x - inversion_size / 2);
			const rect_y = ~~(y - inversion_size / 2);
			const rect_w = inversion_size;
			const rect_h = inversion_size;

			const ctx_dest = this.preview_canvas.ctx;
			const id_src = main_ctx.getImageData(rect_x, rect_y, rect_w, rect_h);
			const id_dest = ctx_dest.getImageData(rect_x, rect_y, rect_w, rect_h);

			for (let i = 0, l = id_dest.data.length; i < l; i += 4) {
				id_dest.data[i + 0] = 255 - id_src.data[i + 0];
				id_dest.data[i + 1] = 255 - id_src.data[i + 1];
				id_dest.data[i + 2] = 255 - id_src.data[i + 2];
				id_dest.data[i + 3] = 255;
				// @TODO maybe: invert based on id_src.data[i+3] and the checkered background
			}

			ctx_dest.putImageData(id_dest, rect_x, rect_y);
		},
		pointerup() {
			this.preview_canvas.width = 1;
			this.preview_canvas.height = 1;

			const contents_within_polygon = copy_contents_within_polygon(
				main_canvas,
				this.points,
				this.x_min,
				this.y_min,
				this.x_max,
				this.y_max
			);

			if (selection) {
				// for silly multitools feature
				show_error_message("This isn't supposed to happen: Free-Form Select after Select in the tool chain?");
				meld_selection_into_canvas();
			}

			undoable({
				name: localize("Free-Form Select"),
				icon: get_icon_for_tool(get_tool_by_id(TOOL_FREE_FORM_SELECT)),
				soft: true,
			}, () => {
				selection = new OnCanvasSelection(
					this.x_min,
					this.y_min,
					this.x_max - this.x_min,
					this.y_max - this.y_min,
					contents_within_polygon,
				);
				selection.cut_out_background();
			});
		},
		cancel() {
			if (!this.preview_canvas) { return; }
			this.preview_canvas.width = 1;
			this.preview_canvas.height = 1;
		},
		drawPreviewUnderGrid(ctx, x, y, grid_visible, scale, translate_x, translate_y) {
			if (!pointer_active && !pointer_over_canvas) { return; }
			if (!this.preview_canvas) { return; }

			ctx.scale(scale, scale);
			ctx.translate(translate_x, translate_y);

			ctx.drawImage(this.preview_canvas, 0, 0);
		},
		$options: $choose_transparent_mode
	}, {
		id: TOOL_SELECT,
		name: localize("Select"),
		speech_recognition: [
			// formulaic combinations
			"select", "rectangle select", "rectangular select", "box select", "square select", "drag select", "select rectangle", "select by rectangle", "select rectangular region", "select rectangular area", "rectangular region select", "rectangular area select",
			"selection", "rectangle selection", "rectangular selection", "box selection", "square selection", "rectangular region selection", "rectangular area selection",
			"selector", "rectangle selector", "rectangular selector", "box selector", "square selector", "drag selector", "rectangular region selector", "rectangular area selector",
			// misc
			"make selection", "make a selection", "select a rectangle", "select a box", "select a rectangular region", "select a rectangular area", "selection box",
			"part of image", "part of picture", "part of canvas", "part of the image", "part of the picture", "part of the canvas",
			"create selection", "create a selection", "selection maker", "selection box maker",
		],
		help_icon: "p_sel.gif",
		description: localize("Selects a rectangular part of the picture to move, copy, or edit."),
		cursor: ["precise", [16, 16], "crosshair"],
		selectBox(rect_x, rect_y, rect_width, rect_height) {
			if (rect_width > 1 && rect_height > 1) {
				var free_form_selection = selection;
				if (selection) {
					// for silly multitools feature
					meld_selection_into_canvas();
				}
				if (ctrl) {
					undoable({ name: "Crop" }, () => {
						var cropped_canvas = make_canvas(rect_width, rect_height);
						cropped_canvas.ctx.drawImage(main_canvas, -rect_x, -rect_y);
						main_ctx.copy(cropped_canvas);
						canvas_handles.show();
						$canvas_area.trigger("resize");
					});
				} else if (free_form_selection) {
					// for silly multitools feature,
					// create a selection that's the Free-Form selection XOR the normal selection

					var x_min = Math.min(free_form_selection.x, rect_x);
					var y_min = Math.min(free_form_selection.y, rect_y);
					var x_max = Math.max(free_form_selection.x + free_form_selection.width, rect_x + rect_width);
					var y_max = Math.max(free_form_selection.y + free_form_selection.height, rect_y + rect_height);

					var contents_canvas = make_canvas(
						x_max - x_min,
						y_max - y_min,
					);
					var rect_canvas = make_canvas(
						x_max - x_min,
						y_max - y_min,
					);
					rect_canvas.ctx.drawImage(
						main_canvas,
						// source:
						rect_x,
						rect_y,
						rect_width,
						rect_height,
						// dest:
						rect_x - x_min,
						rect_y - y_min,
						rect_width,
						rect_height,
					);

					contents_canvas.ctx.drawImage(
						free_form_selection.canvas,
						free_form_selection.x - x_min,
						free_form_selection.y - y_min,
					);
					contents_canvas.ctx.globalCompositeOperation = "xor";
					contents_canvas.ctx.drawImage(rect_canvas, 0, 0);

					undoable({
						name: `${localize("Free-Form Select")}⊕${localize("Select")}`,
						icon: get_icon_for_tools([
							get_tool_by_id(TOOL_FREE_FORM_SELECT),
							get_tool_by_id(TOOL_SELECT),
						]),
						soft: true,
					}, () => {
						selection = new OnCanvasSelection(
							x_min,
							y_min,
							x_max - x_min,
							y_max - y_min,
							contents_canvas,
						);
						selection.cut_out_background();
					});
				} else {
					undoable({
						name: localize("Select"),
						icon: get_icon_for_tool(get_tool_by_id(TOOL_SELECT)),
						soft: true,
					}, () => {
						selection = new OnCanvasSelection(rect_x, rect_y, rect_width, rect_height);
					});
				}
			}
		},
		$options: $choose_transparent_mode
	}, {
		id: TOOL_ERASER,
		name: localize("Eraser/Color Eraser"),
		speech_recognition: [
			"erase", "eraser", "rubber", "wiper", "clearer", "mark remover", "obliterator", "expunger",
			"color eraser", "color replacer", "replace color", "replace colors",
			"erasing", "erasing tool", "color erasing", "color replacing", "replacing color", "replacing colors", "wiping tool", "rubbing tool", "clearing tool", "mark removing tool", "removal tool", "obliterating tool", "obliteration tool", "expunging tool",
		],
		help_icon: "p_erase.gif",
		description: localize("Erases a portion of the picture, using the selected eraser shape."),
		cursor: ["precise", [16, 16], "crosshair"],

		// binary mask of the drawn area, either opaque white or transparent
		mask_canvas: null,

		get_rect(x, y) {
			const rect_x = Math.ceil(x - eraser_size / 2);
			const rect_y = Math.ceil(y - eraser_size / 2);
			const rect_w = eraser_size;
			const rect_h = eraser_size;
			return { rect_x, rect_y, rect_w, rect_h };
		},

		drawPreviewUnderGrid(ctx, x, y, grid_visible, scale, translate_x, translate_y) {
			if (!pointer_active && !pointer_over_canvas) { return; }
			const { rect_x, rect_y, rect_w, rect_h } = this.get_rect(x, y);

			ctx.scale(scale, scale);
			ctx.translate(translate_x, translate_y);

			if (this.mask_canvas) {
				this.render_from_mask(ctx, true);
				if (transparency) {
					// animate for gradient
					requestAnimationFrame(update_helper_layer);
				}
			}

			ctx.fillStyle = selected_colors.background;
			ctx.fillRect(rect_x, rect_y, rect_w, rect_h);
		},
		drawPreviewAboveGrid(ctx, x, y, grid_visible, scale, translate_x, translate_y) {
			if (!pointer_active && !pointer_over_canvas) { return; }

			const { rect_x, rect_y, rect_w, rect_h } = this.get_rect(x, y);

			ctx.scale(scale, scale);
			ctx.translate(translate_x, translate_y);
			const hairline_width = 1 / scale;

			ctx.strokeStyle = "black";
			ctx.lineWidth = hairline_width;
			if (grid_visible) {
				ctx.strokeRect(rect_x + ctx.lineWidth / 2, rect_y + ctx.lineWidth / 2, rect_w, rect_h);
			} else {
				ctx.strokeRect(rect_x + ctx.lineWidth / 2, rect_y + ctx.lineWidth / 2, rect_w - ctx.lineWidth, rect_h - ctx.lineWidth);
			}
		},
		pointerdown() {
			this.mask_canvas = make_canvas(main_canvas.width, main_canvas.height);
		},
		render_from_mask(ctx, previewing) {
			ctx.save();
			ctx.globalCompositeOperation = "destination-out";
			ctx.drawImage(this.mask_canvas, 0, 0);
			ctx.restore();

			if (previewing || !transparency) {
				let color = selected_colors.background;
				if (transparency) {
					const t = performance.now() / 2000;
					// @TODO: DRY
					// animated rainbow effect representing transparency,
					// in lieu of any good way to draw temporary transparency in the current setup
					// 5 distinct colors, 5 distinct gradients, 7 color stops, 6 gradients
					const n = 6;
					const h = ctx.canvas.height;
					const y = (t % 1) * -h * (n - 1);
					const gradient = ctx.createLinearGradient(0, y, 0, y + h * n);
					gradient.addColorStop(0 / n, "red");
					gradient.addColorStop(1 / n, "gold");
					gradient.addColorStop(2 / n, "#00d90b");
					gradient.addColorStop(3 / n, "#2e64d9");
					gradient.addColorStop(4 / n, "#8f2ed9");
					// last two same as the first two so it can seamlessly wrap
					gradient.addColorStop(5 / n, "red");
					gradient.addColorStop(6 / n, "gold");
					color = gradient;
				}
				const mask_fill_canvas = make_canvas(this.mask_canvas);
				replace_colors_with_swatch(mask_fill_canvas.ctx, color, 0, 0);
				ctx.drawImage(mask_fill_canvas, 0, 0);
			}
		},
		pointerup() {
			if (!this.mask_canvas) {
				return; // not sure why this would happen per se
			}
			undoable({
				name: get_language().match(/^en\b/) ? (this.color_eraser_mode ? "Color Eraser" : "Eraser") : localize("Eraser/Color Eraser"),
				icon: get_icon_for_tool(this),
			}, () => {
				this.render_from_mask(main_ctx);

				this.mask_canvas = null;
			});
		},
		cancel() {
			this.mask_canvas = null;
		},
		paint(ctx, x, y) {
			bresenham_line(pointer_previous.x, pointer_previous.y, pointer.x, pointer.y, (x, y) => {
				this.paint_iteration(ctx, x, y);
			});
		},
		paint_iteration(ctx, x, y) {
			const { rect_x, rect_y, rect_w, rect_h } = this.get_rect(x, y);

			this.color_eraser_mode = button !== 0;

			if (!this.color_eraser_mode) {
				// Eraser
				this.mask_canvas.ctx.fillStyle = "white";
				this.mask_canvas.ctx.fillRect(rect_x, rect_y, rect_w, rect_h);
			} else {
				// Color Eraser
				// Right click with the eraser to selectively replace
				// the selected foreground color with the selected background color

				const fg_rgba = get_rgba_from_color(selected_colors.foreground);

				const test_image_data = ctx.getImageData(rect_x, rect_y, rect_w, rect_h);
				const result_image_data = this.mask_canvas.ctx.getImageData(rect_x, rect_y, rect_w, rect_h);

				const fill_threshold = 1; // 1 is just enough for a workaround for Brave browser's farbling: https://github.com/1j01/jspaint/issues/184

				for (let i = 0, l = test_image_data.data.length; i < l; i += 4) {
					if (
						Math.abs(test_image_data.data[i + 0] - fg_rgba[0]) <= fill_threshold &&
						Math.abs(test_image_data.data[i + 1] - fg_rgba[1]) <= fill_threshold &&
						Math.abs(test_image_data.data[i + 2] - fg_rgba[2]) <= fill_threshold &&
						Math.abs(test_image_data.data[i + 3] - fg_rgba[3]) <= fill_threshold
					) {
						result_image_data.data[i + 0] = 255;
						result_image_data.data[i + 1] = 255;
						result_image_data.data[i + 2] = 255;
						result_image_data.data[i + 3] = 255;
					}
				}

				this.mask_canvas.ctx.putImageData(result_image_data, rect_x, rect_y);
			}
		},
		$options: $choose_eraser_size
	}, {
		id: TOOL_FILL,
		name: localize("Fill With Color"),
		speech_recognition: [
			"fill with color", "flood fill", "fill", "flood filling", "flood-filling", "floodfilling", "floodfill",
			"fill area with color", "flood fill area", "fill area", "color area", "area fill", "area filling", "filling area",
			"fill region with color", "flood fill region", "fill region", "color region", "region fill", "region filling", "filling region",
			"fill bucket", "paint bucket", "paint can", "dump", "splash", "paintbucket", "bucket", "dumping", "paint dumping", "paint dumper", "dumper", "dump bucket", "color filler", "filler",
		],
		help_icon: "p_paint.gif",
		description: "Fills an area with the selected drawing color.",
		cursor: ["fill-bucket", [8, 22], "crosshair"],
		pointerdown(ctx, x, y) {
			if (shift) {
				undoable({
					name: "Replace Color",
					icon: get_icon_for_tool(this),
				}, () => {
					// Perform global color replacement
					draw_noncontiguous_fill(ctx, x, y, fill_color);
				});
			} else {
				undoable({
					name: localize("Fill With Color"),
					icon: get_icon_for_tool(this),
				}, () => {
					// Perform a normal fill operation
					draw_fill(ctx, x, y, fill_color);
				});
			}
		}
	}, {
		id: TOOL_PICK_COLOR,
		name: localize("Pick Color"),
		speech_recognition: [
			"pick color", "select color", "color select", "color selector", "color picker", "pick a color", "color picking", "color choosing", "color selecting", "color chooser", "color lift", "color lifter", "color lifting", "lift color",
			"eyedropper", "eye dropper", "eye-dropper", "pipette", "Pasteur pipette", "dropper", "eye drop", "eye-drop", "eyedrop", "suck up color", "absorb color",
			"choose color from image", "choose color from picture", "choose color from canvas",
			"select color from image", "select color from picture", "select color from canvas",
			"choose color from the image", "choose color from the picture", "choose color from the canvas",
			"select color from the image", "select color from the picture", "select color from the canvas",
			"choose a color from the image", "choose a color from the picture", "choose a color from the canvas",
			"select a color from the image", "select a color from the picture", "select a color from the canvas",
			"choose a color from image", "choose a color from picture", "choose a color from canvas",
			"select a color from image", "select a color from picture", "select a color from canvas",
			"pick color from canvas", "pick color from document", "pick color from page", "pick color from image", "pick color from picture",
			"pick color from the canvas", "pick color from the document", "pick color from the page", "pick color from the image", "pick color from the picture",
			"pick a color from canvas", "pick a color from document", "pick a color from page", "pick a color from image", "pick a color from picture",
			"pick a color from the canvas", "pick a color from the document", "pick a color from the page", "pick a color from the image", "pick a color from the picture",
		],
		help_icon: "p_eye.gif",
		description: localize("Picks up a color from the picture for drawing."),
		cursor: ["eye-dropper", [9, 22], "crosshair"],
		deselect: true,

		current_color: "",
		display_current_color() {
			this.$options.css({
				background: this.current_color
			});
		},
		pointerdown() {
			$G.one("pointerup", () => {
				this.$options.css({
					background: ""
				});
			});
		},
		paint(ctx, x, y) {
			if (x >= 0 && y >= 0 && x < main_canvas.width && y < main_canvas.height) {
				const id = ctx.getImageData(~~x, ~~y, 1, 1);
				const [r, g, b, a] = id.data;
				this.current_color = `rgba(${r},${g},${b},${a / 255})`;
			} else {
				this.current_color = "white";
			}
			this.display_current_color();
		},
		pointerup() {
			selected_colors[fill_color_k] = this.current_color;
			$G.trigger("option-changed");
		},
		$options: $(E("div"))
	}, {
		id: TOOL_MAGNIFIER,
		name: localize("Magnifier"),
		speech_recognition: [
			"magnifier", "magnifying glass", "loupe", "hand lens", "hand glass", "eyeglass", "eye glass", "lens", "simple microscope", "microscope", "glass", "spyglass", "telescope",
			"magnification", "zoom", "zoom in", "zoom out", "zoomer", "magnifying", "zooming", "enlarging tool",
		],
		help_icon: "p_zoom.gif",
		description: localize("Changes the magnification."),
		cursor: ["magnifier", [16, 16], "zoom-in"], // overridden below
		deselect: true,

		getProspectiveMagnification: () => (
			magnification === 1 ? return_to_magnification : 1
		),

		drawPreviewAboveGrid(ctx, x, y, grid_visible, scale, translate_x, translate_y) {
			if (!pointer_active && !pointer_over_canvas) { return; }
			if (pointer_active) { return; }
			const prospective_magnification = this.getProspectiveMagnification();

			// hacky place to put this but whatever
			// use specific zoom-in/zoom-out as fallback,
			// even though the custom cursor image is less descriptive
			// because there's no generic "zoom" css cursor
			if (prospective_magnification < magnification) {
				$canvas.css({
					cursor: make_css_cursor("magnifier", [16, 16], "zoom-out"),
				});
			} else {
				$canvas.css({
					cursor: make_css_cursor("magnifier", [16, 16], "zoom-in"),
				});
			}

			if (prospective_magnification < magnification) { return; } // hide if would be zooming out

			// prospective viewport size in document coords
			const w = $canvas_area.width() / prospective_magnification;
			const h = $canvas_area.height() / prospective_magnification;

			let rect_x1 = ~~(x - w / 2);
			let rect_y1 = ~~(y - h / 2);

			// try to move rect into bounds without squishing
			rect_x1 = Math.max(0, rect_x1);
			rect_y1 = Math.max(0, rect_y1);
			rect_x1 = Math.min(main_canvas.width - w, rect_x1);
			rect_y1 = Math.min(main_canvas.height - h, rect_y1);

			let rect_x2 = rect_x1 + w;
			let rect_y2 = rect_y1 + h;

			// clamp rect to bounds (with squishing)
			rect_x1 = Math.max(0, rect_x1);
			rect_y1 = Math.max(0, rect_y1);
			rect_x2 = Math.min(main_canvas.width, rect_x2);
			rect_y2 = Math.min(main_canvas.height, rect_y2);

			const rect_w = rect_x2 - rect_x1;
			const rect_h = rect_y2 - rect_y1;
			const rect_x = rect_x1;
			const rect_y = rect_y1;

			const id_src = main_canvas.ctx.getImageData(rect_x, rect_y, rect_w + 1, rect_h + 1);
			const id_dest = ctx.getImageData((rect_x + translate_x) * scale, (rect_y + translate_y) * scale, rect_w * scale + 1, rect_h * scale + 1);

			function copyPixelInverted(x_dest, y_dest) {
				const x_src = ~~(x_dest / scale);
				const y_src = ~~(y_dest / scale);
				const index_src = (x_src + y_src * id_src.width) * 4;
				const index_dest = (x_dest + y_dest * id_dest.width) * 4;
				id_dest.data[index_dest + 0] = 255 - id_src.data[index_src + 0];
				id_dest.data[index_dest + 1] = 255 - id_src.data[index_src + 1];
				id_dest.data[index_dest + 2] = 255 - id_src.data[index_src + 2];
				id_dest.data[index_dest + 3] = 255;
				// @TODO maybe: invert based on id_src.data[index_src+3] and the checkered background
			}

			for (let x = 0, limit = id_dest.width; x < limit; x += 1) {
				copyPixelInverted(x, 0);
				copyPixelInverted(x, id_dest.height - 1);
			}
			for (let y = 1, limit = id_dest.height - 1; y < limit; y += 1) {
				copyPixelInverted(0, y);
				copyPixelInverted(id_dest.width - 1, y);
			}

			// for debug: fill rect
			// for (let x = 0, x_limit = id_dest.width; x < x_limit; x += 1) {
			// 	for (let y = 1, y_limit = id_dest.height - 1; y < y_limit; y += 1) {
			// 		copyPixelInverted(x, y);
			// 	}
			// }

			ctx.putImageData(id_dest, (rect_x + translate_x) * scale, (rect_y + translate_y) * scale);

			// debug:
			// ctx.scale(scale, scale);
			// ctx.translate(translate_x, translate_y);
			// ctx.strokeStyle = "#f0f";
			// ctx.strokeRect(rect_x1, rect_y1, rect_w, rect_h);
		},
		pointerdown(ctx, x, y) {
			const prev_magnification = magnification;
			const prospective_magnification = this.getProspectiveMagnification();

			set_magnification(prospective_magnification);

			if (magnification > prev_magnification) {

				// (new) viewport size in document coords
				const w = $canvas_area.width() / magnification;
				const h = $canvas_area.height() / magnification;

				$canvas_area.scrollLeft((x - w / 2) * magnification / prev_magnification);
				// Nevermind, canvas, isn't aligned to the right in RTL layout!
				// if (get_direction() === "rtl") {
				// 	// scrollLeft coordinates can be negative for RTL
				// 	$canvas_area.scrollLeft((x - w/2 - canvas.width) * magnification / prev_magnification + $canvas_area.innerWidth());
				// } else {
				// 	$canvas_area.scrollLeft((x - w/2) * magnification / prev_magnification);
				// }
				$canvas_area.scrollTop((y - h / 2) * magnification / prev_magnification);
				$canvas_area.trigger("scroll");
			}
		},
		$options: $choose_magnification
	}, {
		id: TOOL_PENCIL,
		name: localize("Pencil"),
		speech_recognition: [
			"pencil", "lead", "graphite", "pen", "pixel", "pixel art", "penciling", "penning", "pixeling",
		],
		help_icon: "p_pencil.gif",
		description: localize("Draws a free-form line one pixel wide."),
		cursor: ["pencil", [13, 23], "crosshair"],
		stroke_only: true,
		get_brush() {
			return { size: pencil_size, shape: "circle" };
		}
	}, {
		id: TOOL_BRUSH,
		name: localize("Brush"),
		speech_recognition: [
			"brush", "paint brush", "paintbrush",
			// "paint", // could also be the paint bucket tool; might be too general, matching saying "MS Paint" / "JS Paint"
			"paint tool", // could also be the paint bucket tool
			"painting tool", "brushing paint tool", "paint brushing tool", "brushing",
			// @TODO: specific brush shapes:
			// "calligraphy", "nib", "slanted brush", "square brush", "circle brush", "circular brush",
		],
		help_icon: "p_brush.gif",
		description: localize("Draws using a brush with the selected shape and size."),
		cursor: ["precise-dotted", [16, 16], "crosshair"],
		dynamic_preview_cursor: true,
		get_brush() {
			return { size: brush_size, shape: brush_shape };
		},
		$options: $choose_brush
	}, {
		id: TOOL_AIRBRUSH,
		name: localize("Airbrush"),
		speech_recognition: [
			"air brush", "airbrush", "aerograph", "airbrushing", "air brushing",
			"spray paint", "spraypaint", "paint spray", "spray painting", "spraypainting",
			"spray paint can", "spraypaint can", "spraycan", "spray-can", "spray can",
			"graffiti", "scatter", "splatter", "scattering", "splattering", "aerosol", "aerosol can", "throwie", "flamethrower",
		],
		help_icon: "p_airb.gif",
		description: localize("Draws using an airbrush of the selected size."),
		cursor: ["airbrush", [7, 22], "crosshair"],
		paint_on_time_interval: 5,
		paint_mask(ctx, x, y) {
			const r = airbrush_size / 2;
			for (let i = 0; i < 6 + r / 5; i++) {
				const rx = (Math.random() * 2 - 1) * r;
				const ry = (Math.random() * 2 - 1) * r;
				const d = rx * rx + ry * ry;
				if (d <= r * r) {
					ctx.fillRect(x + ~~rx, y + ~~ry, 1, 1);
				}
			}
			update_helper_layer();
		},
		$options: $choose_airbrush_size
	}, {
		id: TOOL_TEXT,
		name: localize("Text"),
		speech_recognition: [
			"text", "type", "typography", "write", "writing", "words", "text box", "text-box", "textbox", "word", "lettering", "font", "fonts", "texts",
		],
		help_icon: "p_txt.gif",
		description: localize("Inserts text into the picture."),
		cursor: ["precise", [16, 16], "crosshair"],
		preload() {
			setTimeout(FontDetective.preload, 10);
		},
		selectBox(rect_x, rect_y, rect_width, rect_height) {
			if (rect_width > 1 && rect_height > 1) {
				textbox = new OnCanvasTextBox(rect_x, rect_y, rect_width, rect_height);
			}
		},
		$options: $choose_transparent_mode
	}, {
		id: TOOL_LINE,
		name: localize("Line"),
		speech_recognition: [
			"line", "line segment", "straight line",
			"lines", "line segments", "straight lines",
		],
		help_icon: "p_line.gif",
		description: localize("Draws a straight line with the selected line width."),
		cursor: ["precise", [16, 16], "crosshair"],
		stroke_only: true,
		shape(ctx, x, y, w, h) {
			update_brush_for_drawing_lines(stroke_size);
			draw_line(ctx, x, y, x + w, y + h, stroke_size);
		},
		$options: $choose_stroke_size
	}, {
		id: TOOL_CURVE,
		name: localize("Curve"),
		speech_recognition: [
			"curve", "curved line", "curvy", "curvy line", "Bezier", "Bezier curve", "spline", "curves", "splines", "curved", "curving",
			"wave", "wavy line", "rounded line", "round line", "oscilloscope", "sine wave", "cosine", "cosine wave",
		],
		help_icon: "p_curve.gif",
		description: localize("Draws a curved line with the selected line width."),
		cursor: ["precise", [16, 16], "crosshair"],
		stroke_only: true,
		points: [],
		preview_canvas: null,
		pointerup(ctx, x, y) {
			if (this.points.length >= 4) {
				undoable({
					name: localize("Curve"),
					icon: get_icon_for_tool(this),
				}, () => {
					ctx.drawImage(this.preview_canvas, 0, 0);
				});
				this.points = [];
			}
		},
		pointerdown(ctx, x, y) {
			if (this.points.length < 1) {
				this.preview_canvas = make_canvas(main_canvas.width, main_canvas.height);
				this.points.push({ x, y });
				if (!$("body").hasClass("eye-gaze-mode")) {
					// second point so first action draws a line
					this.points.push({ x, y });
				}
			} else {
				this.points.push({ x, y });
			}
		},
		paint(ctx, x, y) {
			if (this.points.length < 1) { return; }

			update_brush_for_drawing_lines(stroke_size);

			const i = this.points.length - 1;
			this.points[i].x = x;
			this.points[i].y = y;

			this.preview_canvas.ctx.clearRect(0, 0, this.preview_canvas.width, this.preview_canvas.height);
			this.preview_canvas.ctx.strokeStyle = stroke_color;

			// Draw curves on preview canvas
			if (this.points.length === 4) {
				draw_bezier_curve(
					this.preview_canvas.ctx,
					this.points[0].x, this.points[0].y,
					this.points[2].x, this.points[2].y,
					this.points[3].x, this.points[3].y,
					this.points[1].x, this.points[1].y,
					stroke_size
				);
			} else if (this.points.length === 3) {
				draw_quadratic_curve(
					this.preview_canvas.ctx,
					this.points[0].x, this.points[0].y,
					this.points[2].x, this.points[2].y,
					this.points[1].x, this.points[1].y,
					stroke_size
				);
			} else if (this.points.length === 2) {
				draw_line(
					this.preview_canvas.ctx,
					this.points[0].x, this.points[0].y,
					this.points[1].x, this.points[1].y,
					stroke_size
				);
			} else {
				draw_line(
					this.preview_canvas.ctx,
					this.points[0].x, this.points[0].y,
					this.points[0].x, this.points[0].y,
					stroke_size
				);
			}
		},
		drawPreviewUnderGrid(ctx, x, y, grid_visible, scale, translate_x, translate_y) {
			// if (!pointer_active && !pointer_over_canvas) { return; }
			if (!this.preview_canvas) { return; }
			ctx.scale(scale, scale);
			ctx.translate(translate_x, translate_y);

			if (this.points.length >= 1) {
				ctx.drawImage(this.preview_canvas, 0, 0);
			}
		},
		cancel() {
			this.points = [];
		},
		end() {
			this.points = [];
			update_helper_layer();
		},
		$options: $choose_stroke_size
	}, {
		id: TOOL_RECTANGLE,
		name: localize("Rectangle"),
		speech_recognition: [
			"rectangle", "square", "box", "rect",
			"sharp rectangle", "sharp square", "sharp box", "sharp rect",
			"sharp corners rectangle", "sharp corners square", "sharp corners box", "sharp corners rect",
			"sharp cornered rectangle", "sharp cornered square", "sharp cornered box", "sharp cornered rect",
			"rectangle with sharp corners", "square with sharp corners", "box with sharp corners", "rect with sharp corners",

			"rectangles", "squares", "boxes", "rects",
			"sharp rectangles", "sharp squares", "sharp boxes", "sharp rects",
			"sharp corners rectangles", "sharp corners squares", "sharp corners boxes", "sharp corners rects",
			"sharp cornered rectangles", "sharp cornered squares", "sharp cornered boxes", "sharp cornered rects",
			"rectangles with sharp corners", "squares with sharp corners", "boxes with sharp corners", "rects with sharp corners",
		],
		help_icon: "p_rect.gif",
		description: localize("Draws a rectangle with the selected fill style."),
		cursor: ["precise", [16, 16], "crosshair"],
		shape(ctx, x, y, w, h) {
			if (w < 0) { x += w; w = -w; }
			if (h < 0) { y += h; h = -h; }

			if (this.$options.fill) {
				ctx.fillRect(x, y, w, h);
			}
			if (this.$options.stroke) {
				if (w < stroke_size * 2 || h < stroke_size * 2) {
					ctx.save();
					ctx.fillStyle = ctx.strokeStyle;
					ctx.fillRect(x, y, w, h);
					ctx.restore();
				} else {
					// @TODO: shouldn't that be ~~(stroke_size / 2)?
					ctx.strokeRect(x + stroke_size / 2, y + stroke_size / 2, w - stroke_size, h - stroke_size);
				}
			}
		},
		$options: $ChooseShapeStyle()
	}, {
		id: TOOL_POLYGON,
		name: localize("Polygon"),
		speech_recognition: [
			"polygon", "poly", "shape", "n-gon", "free-form polygon", "freeform polygon", "free form polygon",
			"triangle", "quadrangle", "pentagon", "hexagon", "heptagon", "octagon", "nonagon", "decagon", "undecagon", "dodecagon",

			"polygons", "polys", "shapes", "n-gons", "free-form polygons", "freeform polygons", "free form polygons",
			"triangles", "quadrangles", "pentagons", "hexagons", "heptagons", "octagons", "nonagons", "decagons", "undecagons", "dodecagons",
		],
		help_icon: "p_poly.gif",
		description: localize("Draws a polygon with the selected fill style."),
		cursor: ["precise", [16, 16], "crosshair"],

		// Record the last click for double-clicking
		// A double click happens on pointerdown of a second click
		// (within a cylindrical volume in 2d space + 1d time)
		last_click_pointerdown: { x: -Infinity, y: -Infinity, time: -Infinity },
		last_click_pointerup: { x: -Infinity, y: -Infinity, time: -Infinity },

		// The vertices of the polygon
		points: [],

		// A canvas for rendering a preview of the shape
		preview_canvas: null,

		pointerup(ctx, x, y) {
			if (this.points.length < 1) { return; }

			const i = this.points.length - 1;
			this.points[i].x = x;
			this.points[i].y = y;
			const dx = this.points[i].x - this.points[0].x;
			const dy = this.points[i].y - this.points[0].y;
			const d = Math.sqrt(dx * dx + dy * dy);
			if ($("body").hasClass("eye-gaze-mode")) {
				if (this.points.length >= 3) {
					if (d < stroke_size * 10 + 20) {
						this.complete(ctx);
					}
				}
			} else {
				if (d < stroke_size * 5.1010101) { // arbitrary number (@TODO: find correct value (or formula))
					this.complete(ctx);
				}
			}

			this.last_click_pointerup = { x, y, time: +(new Date) };
		},
		pointerdown(ctx, x, y) {
			if (this.points.length < 1) {
				this.preview_canvas = make_canvas(main_canvas.width, main_canvas.height);

				// Add the first point of the polygon
				this.points.push({ x, y });

				if (!$("body").hasClass("eye-gaze-mode")) {
					// Add a second point so first action draws a line
					this.points.push({ x, y });
				}
			} else {
				const lx = this.last_click_pointerdown.x;
				const ly = this.last_click_pointerdown.y;
				const lt = this.last_click_pointerdown.time;
				const dx = x - lx;
				const dy = y - ly;
				const dt = +(new Date) - lt;
				const d = Math.sqrt(dx * dx + dy * dy);
				if (d < 4.1010101 && dt < 250) { // arbitrary 101 (@TODO: find correct value (or formula))
					this.complete(ctx);
				} else {
					// Add the point
					this.points.push({ x, y });
				}
			}
			this.last_click_pointerdown = { x, y, time: +new Date };
		},
		paint(ctx, x, y) {
			if (this.points.length < 1) { return; }

			const i = this.points.length - 1;
			this.points[i].x = x;
			this.points[i].y = y;

			this.preview_canvas.ctx.clearRect(0, 0, this.preview_canvas.width, this.preview_canvas.height);
			if (this.$options.fill && !this.$options.stroke) {
				this.preview_canvas.ctx.drawImage(main_canvas, 0, 0);
				this.preview_canvas.ctx.strokeStyle = "white";
				this.preview_canvas.ctx.globalCompositeOperation = "difference";
				var orig_stroke_size = stroke_size;
				stroke_size = 2;
				draw_line_strip(
					this.preview_canvas.ctx,
					this.points
				);
				stroke_size = orig_stroke_size;
			} else if (this.points.length > 1) {
				this.preview_canvas.ctx.strokeStyle = stroke_color;
				draw_line_strip(
					this.preview_canvas.ctx,
					this.points
				);
			} else {
				draw_line(
					this.preview_canvas.ctx,
					this.points[0].x, this.points[0].y,
					this.points[0].x, this.points[0].y,
					stroke_size
				);
			}
		},
		drawPreviewUnderGrid(ctx, x, y, grid_visible, scale, translate_x, translate_y) {
			// if (!pointer_active && !pointer_over_canvas) { return; }
			if (!this.preview_canvas) { return; }

			ctx.scale(scale, scale);
			ctx.translate(translate_x, translate_y);

			ctx.drawImage(this.preview_canvas, 0, 0);
		},
		complete(ctx) {
			if (this.points.length >= 3) {
				undoable({
					name: localize("Polygon"),
					icon: get_icon_for_tool(this),
				}, () => {
					ctx.fillStyle = fill_color;
					ctx.strokeStyle = stroke_color;

					var orig_stroke_size = stroke_size;
					if (this.$options.fill && !this.$options.stroke) {
						stroke_size = 2;
						ctx.strokeStyle = fill_color;
					}

					draw_polygon(
						ctx,
						this.points,
						this.$options.stroke || (this.$options.fill && !this.$options.stroke),
						this.$options.fill
					);

					stroke_size = orig_stroke_size;
				});
			}

			this.reset();
		},
		cancel() {
			this.reset();
		},
		end(ctx) {
			this.complete(ctx);
			update_helper_layer();
		},
		reset() {
			this.points = [];
			this.last_click_pointerdown = { x: -Infinity, y: -Infinity, time: -Infinity };
			this.last_click_pointerup = { x: -Infinity, y: -Infinity, time: -Infinity };

			if (!this.preview_canvas) { return; }
			this.preview_canvas.width = 1;
			this.preview_canvas.height = 1;
		},
		shape_colors: true,
		$options: $ChooseShapeStyle()
	}, {
		id: TOOL_ELLIPSE,
		name: localize("Ellipse"),
		speech_recognition: [
			"ellipse", "circle", "oval", "ovoid", "ovaloid", "oviform", "elliptical", "oblong circle", "stretched circle", "ball", "sphere", "round tool", "rounded tool",
			"ellipses", "circles", "ovals", "ovoids", "ovaloids", "oviforms", "ellipticals", "oblong circles", "stretched circles", "balls", "spheres",
		],
		help_icon: "p_oval.gif",
		description: localize("Draws an ellipse with the selected fill style."),
		cursor: ["precise", [16, 16], "crosshair"],
		shape(ctx, x, y, w, h) {
			if (w < 0) { x += w; w = -w; }
			if (h < 0) { y += h; h = -h; }

			if (w < stroke_size || h < stroke_size) {
				ctx.fillStyle = ctx.strokeStyle;
				draw_ellipse(ctx, x, y, w, h, false, true);
			} else {
				draw_ellipse(
					ctx,
					x + ~~(stroke_size / 2),
					y + ~~(stroke_size / 2),
					w - stroke_size,
					h - stroke_size,
					this.$options.stroke,
					this.$options.fill
				);
			}
		},
		$options: $ChooseShapeStyle()
	}, {
		id: TOOL_ROUNDED_RECTANGLE,
		name: localize("Rounded Rectangle"),
		speech_recognition: [
			"rounded rectangle", "rounded square", "rounded box",
			"round rectangle", "round square", "round box",
			"rounded corners rectangle", "rounded corners square", "rounded corners box",
			"round cornered rectangle", "round cornered square", "round cornered box",
			"rounded cornered rectangle", "rounded cornered square", "rounded cornered box",
			"rounded corner rectangle", "rounded corner square", "rounded corner box",
			"rectangle with round corners", "square with round corners", "box with round corners",
			"rectangle with rounded corners", "square with rounded corners", "box with rounded corners",
			"soft rectangle", "soft square", "soft box",
			"soft corners rectangle", "soft corners square", "soft corners box",
			"soft cornered rectangle", "soft cornered square", "soft cornered box",
			"soft corner rectangle", "soft corner square", "soft corner box",
			"rectangle with soft corners", "square with soft corners", "box with soft corners",
			"round rect", "roundrect",

			"rounded rectangles", "rounded squares", "rounded boxes",
			"round rectangles", "round squares", "round boxes",
			"rounded corners rectangles", "rounded corners squares", "rounded corners boxes",
			"round cornered rectangles", "round cornered squares", "round cornered boxes",
			"rounded cornered rectangles", "rounded cornered squares", "rounded cornered boxes",
			"rounded corner rectangles", "rounded corner squares", "rounded corner boxes",
			"rectangles with round corners", "squares with round corners", "boxes with round corners",
			"rectangles with rounded corners", "squares with rounded corners", "boxes with rounded corners",
			"soft rectangles", "soft squares", "soft boxes",
			"soft corners rectangles", "soft corners squares", "soft corners boxes",
			"soft cornered rectangles", "soft cornered squares", "soft cornered boxes",
			"soft corner rectangles", "soft corner squares", "soft corner boxes",
			"rectangles with soft corners", "squares with soft corners", "boxes with soft corners",
			"round rects", "roundrects",
		],
		help_icon: "p_rrect.gif",
		description: localize("Draws a rounded rectangle with the selected fill style."),
		cursor: ["precise", [16, 16], "crosshair"],
		shape(ctx, x, y, w, h) {
			if (w < 0) { x += w; w = -w; }
			if (h < 0) { y += h; h = -h; }

			if (w < stroke_size || h < stroke_size) {
				ctx.fillStyle = ctx.strokeStyle;
				const radius = Math.min(8, w / 2, h / 2);
				// const radius_x = Math.min(8, w/2);
				// const radius_y = Math.min(8, h/2);
				draw_rounded_rectangle(
					ctx,
					x, y, w, h,
					radius, radius,
					// radius_x, radius_y,
					false,
					true
				);
			} else {
				const radius = Math.min(8, (w - stroke_size) / 2, (h - stroke_size) / 2);
				// const radius_x = Math.min(8, (w - stroke_size)/2);
				// const radius_y = Math.min(8, (h - stroke_size)/2);
				draw_rounded_rectangle(
					ctx,
					x + ~~(stroke_size / 2),
					y + ~~(stroke_size / 2),
					w - stroke_size,
					h - stroke_size,
					radius, radius,
					// radius_x, radius_y,
					this.$options.stroke,
					this.$options.fill
				);
			}
		},
		$options: $ChooseShapeStyle()
	}];

	/* eslint-enable no-restricted-syntax */

	tools.forEach((tool) => {
		if (tool.selectBox) {
			let drag_start_x = 0;
			let drag_start_y = 0;
			let pointer_has_moved = false;
			let rect_x = 0;
			let rect_y = 0;
			let rect_width = 0;
			let rect_height = 0;

			tool.pointerdown = () => {
				drag_start_x = pointer.x;
				drag_start_y = pointer.y;
				pointer_has_moved = false;
				$G.one("pointermove", () => {
					pointer_has_moved = true;
				});
				if (selection) {
					meld_selection_into_canvas();
				}
				if (textbox) {
					meld_textbox_into_canvas();
				}
				canvas_handles.hide();
			};
			tool.paint = () => {
				rect_x = ~~Math.max(0, Math.min(drag_start_x, pointer.x));
				rect_y = ~~Math.max(0, Math.min(drag_start_y, pointer.y));
				rect_width = (~~Math.min(main_canvas.width, Math.max(drag_start_x, pointer.x) + 1)) - rect_x;
				rect_height = (~~Math.min(main_canvas.height, Math.max(drag_start_y, pointer.y + 1))) - rect_y;
			};
			tool.pointerup = () => {
				canvas_handles.show();
				tool.selectBox(rect_x, rect_y, rect_width, rect_height);
			};
			tool.cancel = () => {
				canvas_handles.show();
			};
			tool.drawPreviewUnderGrid = (ctx, x, y, grid_visible, scale, translate_x, translate_y) => {
				if (!pointer_active) { return; }
				if (!pointer_has_moved) { return; }

				ctx.scale(scale, scale);
				ctx.translate(translate_x, translate_y);

				// make the document canvas part of the helper canvas so that inversion can apply to it
				ctx.drawImage(main_canvas, 0, 0);
			};
			tool.drawPreviewAboveGrid = (ctx, x, y, grid_visible, scale, translate_x, translate_y) => {
				if (!pointer_active) { return; }
				if (!pointer_has_moved) { return; }

				draw_selection_box(ctx, rect_x, rect_y, rect_width, rect_height, scale, translate_x, translate_y);
			};
		}
		if (tool.shape) {
			tool.shape_canvas = null;
			tool.pointerdown = () => {
				tool.shape_canvas = make_canvas(main_canvas.width, main_canvas.height);
			};
			tool.paint = () => {
				tool.shape_canvas.ctx.clearRect(0, 0, tool.shape_canvas.width, tool.shape_canvas.height);
				tool.shape_canvas.ctx.fillStyle = main_ctx.fillStyle;
				tool.shape_canvas.ctx.strokeStyle = main_ctx.strokeStyle;
				tool.shape_canvas.ctx.lineWidth = main_ctx.lineWidth;
				tool.shape(tool.shape_canvas.ctx, pointer_start.x, pointer_start.y, pointer.x - pointer_start.x, pointer.y - pointer_start.y);
			};
			tool.pointerup = () => {
				if (!tool.shape_canvas) { return; }
				undoable({
					name: tool.name,
					icon: get_icon_for_tool(tool),
				}, () => {
					main_ctx.drawImage(tool.shape_canvas, 0, 0);
					tool.shape_canvas = null;
				});
			};
			tool.drawPreviewUnderGrid = (ctx, x, y, grid_visible, scale, translate_x, translate_y) => {
				if (!pointer_active) { return; }
				if (!tool.shape_canvas) { return; }

				ctx.scale(scale, scale);
				ctx.translate(translate_x, translate_y);

				ctx.drawImage(tool.shape_canvas, 0, 0);
			};
		}
		if (tool.paint_mask) {

			// binary mask of the drawn area, either opaque white or transparent
			tool.mask_canvas = null;

			tool.pointerdown = (ctx, x, y) => {
				if (!tool.mask_canvas) {
					tool.mask_canvas = make_canvas(main_canvas.width, main_canvas.height);
				}
				if (tool.mask_canvas.width !== main_canvas.width) {
					tool.mask_canvas.width = main_canvas.width;
				}
				if (tool.mask_canvas.height !== main_canvas.height) {
					tool.mask_canvas.height = main_canvas.height;
				}
				tool.mask_canvas.ctx.disable_image_smoothing();
			};
			tool.pointerup = () => {
				if (!tool.mask_canvas) {
					return; // not sure why this would happen per se
				}
				undoable({
					name: tool.name,
					icon: get_icon_for_tool(tool),
				}, () => {
					tool.render_from_mask(main_ctx);

					tool.mask_canvas.width = 1;
					tool.mask_canvas.height = 1;
				});
			};
			tool.paint = (ctx, x, y) => {
				tool.paint_mask(tool.mask_canvas.ctx, x, y);
			};
			tool.cancel = () => {
				if (tool.mask_canvas) {
					tool.mask_canvas.width = 1;
					tool.mask_canvas.height = 1;
				}
			};
			tool.render_from_mask = (ctx, previewing) => { // could be private
				ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.drawImage(tool.mask_canvas, 0, 0);
				ctx.restore();

				let color = stroke_color;
				// I've seen firefox give [ 254, 254, 254, 254 ] for get_rgba_from_color("#fff")
				// or other values
				// even with privacy.resistFingerprinting set to false
				// the canvas API is just genuinely not reliable for exact color values
				const translucent = get_rgba_from_color(color)[3] < 253;
				if (translucent && previewing) {
					const t = performance.now() / 2000;
					// @TODO: DRY
					// animated rainbow effect representing transparency,
					// in lieu of any good way to draw temporary transparency in the current setup
					// 5 distinct colors, 5 distinct gradients, 7 color stops, 6 gradients
					const n = 6;
					const h = ctx.canvas.height;
					const y = (t % 1) * -h * (n - 1);
					const gradient = ctx.createLinearGradient(0, y, 0, y + h * n);
					gradient.addColorStop(0 / n, "red");
					gradient.addColorStop(1 / n, "gold");
					gradient.addColorStop(2 / n, "#00d90b");
					gradient.addColorStop(3 / n, "#2e64d9");
					gradient.addColorStop(4 / n, "#8f2ed9");
					// last two same as the first two so it can seamlessly wrap
					gradient.addColorStop(5 / n, "red");
					gradient.addColorStop(6 / n, "gold");
					color = gradient;
				}
				// @TODO: perf: keep this canvas around too
				const mask_fill_canvas = make_canvas(tool.mask_canvas);
				replace_colors_with_swatch(mask_fill_canvas.ctx, color, 0, 0);
				ctx.drawImage(mask_fill_canvas, 0, 0);
				return translucent;
			};
			tool.drawPreviewUnderGrid = (ctx, x, y, grid_visible, scale, translate_x, translate_y) => {
				if (!pointer_active && !pointer_over_canvas) { return; }

				ctx.scale(scale, scale);
				ctx.translate(translate_x, translate_y);

				if (tool.mask_canvas) {
					const should_animate = tool.render_from_mask(ctx, true);
					if (should_animate) {
						// animate for gradient
						requestAnimationFrame(update_helper_layer);
					}
				}
			};
		}
		if (tool.get_brush) {
			// binary mask of the drawn area, either opaque white or transparent
			tool.mask_canvas = null;

			tool.init_mask_canvas = (ctx, x, y) => {
				if (!tool.mask_canvas) {
					tool.mask_canvas = make_canvas(main_canvas.width, main_canvas.height);
				}
				if (tool.mask_canvas.width !== main_canvas.width) {
					tool.mask_canvas.width = main_canvas.width;
				}
				if (tool.mask_canvas.height !== main_canvas.height) {
					tool.mask_canvas.height = main_canvas.height;
				}
				tool.mask_canvas.ctx.disable_image_smoothing();
			};
			tool.pointerdown = (ctx, x, y) => {
				tool.init_mask_canvas();
			};
			tool.pointerup = () => {
				undoable({
					name: tool.name,
					icon: get_icon_for_tool(tool),
				}, () => {
					tool.render_from_mask(main_ctx);

					tool.mask_canvas.width = 1;
					tool.mask_canvas.height = 1;
				});
			};

			tool.paint = () => {
				const brush = tool.get_brush();
				const circumference_points = get_circumference_points_for_brush(brush.shape, brush.size);
				tool.mask_canvas.ctx.fillStyle = stroke_color;
				const iterate_line = brush.size > 1 ? bresenham_dense_line : bresenham_line;
				iterate_line(pointer_previous.x, pointer_previous.y, pointer.x, pointer.y, (x, y) => {
					for (const point of circumference_points) {
						tool.mask_canvas.ctx.fillRect(x + point.x, y + point.y, 1, 1);
					}
				});
				stamp_brush_canvas(tool.mask_canvas.ctx, pointer_previous.x, pointer_previous.y, brush.shape, brush.size);
				stamp_brush_canvas(tool.mask_canvas.ctx, pointer.x, pointer.y, brush.shape, brush.size);
			};

			tool.cancel = () => {
				if (tool.mask_canvas) {
					tool.mask_canvas.width = 1;
					tool.mask_canvas.height = 1;
				}
			};
			tool.render_from_mask = (ctx, previewing) => { // could be private
				ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.drawImage(tool.mask_canvas, 0, 0);
				ctx.restore();

				let color = stroke_color;
				// I've seen firefox give [ 254, 254, 254, 254 ] for get_rgba_from_color("#fff")
				// or other values
				// even with privacy.resistFingerprinting set to false
				// the canvas API is just genuinely not reliable for exact color values
				const translucent = get_rgba_from_color(color)[3] < 253;
				if (translucent && previewing) {
					const t = performance.now() / 2000;
					// @TODO: DRY
					// animated rainbow effect representing transparency,
					// in lieu of any good way to draw temporary transparency in the current setup
					// 5 distinct colors, 5 distinct gradients, 7 color stops, 6 gradients
					const n = 6;
					const h = ctx.canvas.height;
					const y = (t % 1) * -h * (n - 1);
					const gradient = ctx.createLinearGradient(0, y, 0, y + h * n);
					gradient.addColorStop(0 / n, "red");
					gradient.addColorStop(1 / n, "gold");
					gradient.addColorStop(2 / n, "#00d90b");
					gradient.addColorStop(3 / n, "#2e64d9");
					gradient.addColorStop(4 / n, "#8f2ed9");
					// last two same as the first two so it can seamlessly wrap
					gradient.addColorStop(5 / n, "red");
					gradient.addColorStop(6 / n, "gold");
					color = gradient;
				}
				// @TODO: perf: keep this canvas around too
				const mask_fill_canvas = make_canvas(tool.mask_canvas);
				if (previewing && tool.dynamic_preview_cursor) {
					const brush = tool.get_brush();
					// dynamic cursor preview:
					// stamp just onto this temporary canvas so it's temporary
					stamp_brush_canvas(mask_fill_canvas.ctx, pointer.x, pointer.y, brush.shape, brush.size);
				}
				replace_colors_with_swatch(mask_fill_canvas.ctx, color, 0, 0);
				ctx.drawImage(mask_fill_canvas, 0, 0);
				return translucent;
			};
			tool.drawPreviewUnderGrid = (ctx, x, y, grid_visible, scale, translate_x, translate_y) => {
				if (!pointer_active && !pointer_over_canvas) { return; }

				ctx.scale(scale, scale);
				ctx.translate(translate_x, translate_y);

				tool.init_mask_canvas();

				const should_animate = tool.render_from_mask(ctx, true);

				if (should_animate) {
					// animate for gradient
					requestAnimationFrame(update_helper_layer);
				}
			};
		}
	});

})();
