
class OnCanvasSelection extends OnCanvasObject {
	constructor(x, y, width, height, img_or_canvas) {
		super(x, y, width, height, true);

		this.$el.addClass("selection");
		let last_tool_transparent_mode = tool_transparent_mode;
		let last_background_color = selected_colors.background;
		this._on_option_changed = () => {
			if (!this.source_canvas) {
				return;
			}
			if (last_tool_transparent_mode !== tool_transparent_mode ||
				last_background_color !== selected_colors.background) {
				last_tool_transparent_mode = tool_transparent_mode;
				last_background_color = selected_colors.background;
				this.update_tool_transparent_mode();
			}
		};
		$G.on("option-changed", this._on_option_changed);

		this.instantiate(img_or_canvas);
	}
	position() {
		super.position(true);
		update_helper_layer(); // @TODO: under-grid specific helper layer?
	}
	instantiate(img_or_canvas) {
		this.$el.css({
			cursor: make_css_cursor("move", [8, 8], "move"),
			touchAction: "none",
		});
		this.position();

		const instantiate = () => {
			if (img_or_canvas) {
				// (this applies when pasting a selection)
				// NOTE: need to create a Canvas because something about imgs makes dragging not work with magnification
				// (width vs naturalWidth?)
				// and at least apply_image_transformation needs it to be a canvas now (and the property name says canvas anyways)
				this.source_canvas = make_canvas(img_or_canvas);
				// @TODO: is this width/height code needed? probably not! wouldn't it clear the canvas anyways?
				// but maybe we should assert in some way that the widths are the same, or resize the selection?
				if (this.source_canvas.width !== this.width) {
					this.source_canvas.width = this.width;
				}
				if (this.source_canvas.height !== this.height) {
					this.source_canvas.height = this.height;
				}
				this.canvas = make_canvas(this.source_canvas);
			}
			else {
				this.source_canvas = make_canvas(this.width, this.height);
				this.source_canvas.ctx.drawImage(main_canvas, this.x, this.y, this.width, this.height, 0, 0, this.width, this.height);
				this.canvas = make_canvas(this.source_canvas);
				this.cut_out_background();
			}
			this.$el.append(this.canvas);
			this.handles = new Handles({
				$handles_container: this.$el,
				$object_container: $canvas_area,
				outset: 2,
				get_rect: () => ({ x: this.x, y: this.y, width: this.width, height: this.height }),
				set_rect: ({ x, y, width, height }) => {
					undoable({
						name: "Resize Selection",
						icon: get_icon_for_tool(get_tool_by_id(TOOL_SELECT)),
						soft: true,
					}, () => {
						this.x = x;
						this.y = y;
						this.width = width;
						this.height = height;
						this.position();
						this.resize();
					});
				},
				get_ghost_offset_left: () => parseFloat($canvas_area.css("padding-left")) + 1,
				get_ghost_offset_top: () => parseFloat($canvas_area.css("padding-top")) + 1,
			});
			let mox, moy;
			const pointermove = e => {
				make_or_update_undoable({
					match: (history_node) =>
						(e.shiftKey && history_node.name.match(/^(Smear|Stamp|Move) Selection$/)) ||
						(!e.shiftKey && history_node.name.match(/^Move Selection$/)),
					name: e.shiftKey ? "Smear Selection" : "Move Selection",
					update_name: true,
					icon: get_icon_for_tool(get_tool_by_id(TOOL_SELECT)),
					soft: true,
				}, () => {
					const m = to_canvas_coords(e);
					this.x = Math.max(Math.min(m.x - mox, main_canvas.width), -this.width);
					this.y = Math.max(Math.min(m.y - moy, main_canvas.height), -this.height);
					this.position();
					if (e.shiftKey) {
						// Smear selection
						this.draw();
					}
				});
			};
			this.canvas_pointerdown = e => {
				e.preventDefault();
				const rect = this.canvas.getBoundingClientRect();
				const cx = e.clientX - rect.left;
				const cy = e.clientY - rect.top;
				mox = ~~(cx / rect.width * this.canvas.width);
				moy = ~~(cy / rect.height * this.canvas.height);
				$G.on("pointermove", pointermove);
				this.dragging = true;
				update_helper_layer(); // for thumbnail, which draws textbox outline if it's not being dragged
				$G.one("pointerup", () => {
					$G.off("pointermove", pointermove);
					this.dragging = false;
					update_helper_layer(); // for thumbnail, which draws selection outline if it's not being dragged
				});
				if (e.shiftKey) {
					// Stamp or start to smear selection
					undoable({
						name: "Stamp Selection",
						icon: get_icon_for_tool(get_tool_by_id(TOOL_SELECT)),
						soft: true,
					}, () => {
						this.draw();
					});
				}
				// @TODO: how should this work for macOS? where ctrl+click = secondary click?
				else if (e.ctrlKey) {
					// Stamp selection
					undoable({
						name: "Stamp Selection",
						icon: get_icon_for_tool(get_tool_by_id(TOOL_SELECT)),
						soft: true,
					}, () => {
						this.draw();
					});
				}
			};
			$(this.canvas).on("pointerdown", this.canvas_pointerdown);
			$canvas_area.trigger("resize");
			$status_position.text("");
			$status_size.text("");
		};

		instantiate();
	}
	cut_out_background() {
		const cutout = this.canvas;
		// doc/this or canvas/cutout, either of those pairs would result in variable names of equal length which is nice :)
		const canvasImageData = main_ctx.getImageData(this.x, this.y, this.width, this.height);
		const cutoutImageData = cutout.ctx.getImageData(0, 0, this.width, this.height);
		// cutoutImageData is initialized with the shape to be cut out (whether rectangular or polygonal)
		// and should end up as the cut out image data for the selection
		// canvasImageData is initially the portion of image data on the canvas,
		// and should end up as... the portion of image data on the canvas that it should end up as.
		// @TODO: could simplify by making the later (shared) condition just if (colored_cutout)
		// but might change how it works anyways so whatever
		// if (!transparency) { // now if !transparency or if tool_transparent_mode
		// this is mainly in order to support patterns as the background color
		// NOTE: must come before cutout canvas is modified
		const colored_cutout = make_canvas(cutout);
		replace_colors_with_swatch(colored_cutout.ctx, selected_colors.background, this.x, this.y);
		// const colored_cutout_image_data = colored_cutout.ctx.getImageData(0, 0, this.width, this.height);
		// }
		for (let i = 0; i < cutoutImageData.data.length; i += 4) {
			const in_cutout = cutoutImageData.data[i + 3] > 0;
			if (in_cutout) {
				cutoutImageData.data[i + 0] = canvasImageData.data[i + 0];
				cutoutImageData.data[i + 1] = canvasImageData.data[i + 1];
				cutoutImageData.data[i + 2] = canvasImageData.data[i + 2];
				cutoutImageData.data[i + 3] = canvasImageData.data[i + 3];
				canvasImageData.data[i + 0] = 0;
				canvasImageData.data[i + 1] = 0;
				canvasImageData.data[i + 2] = 0;
				canvasImageData.data[i + 3] = 0;
			}
			else {
				cutoutImageData.data[i + 0] = 0;
				cutoutImageData.data[i + 1] = 0;
				cutoutImageData.data[i + 2] = 0;
				cutoutImageData.data[i + 3] = 0;
			}
		}
		main_ctx.putImageData(canvasImageData, this.x, this.y);
		cutout.ctx.putImageData(cutoutImageData, 0, 0);
		this.update_tool_transparent_mode();
		// NOTE: in case you want to use the tool_transparent_mode
		// in a document with transparency (for an operation in an area where there's a local background color)
		// (and since currently switching to the opaque document mode makes the image opaque)
		// (and it would be complicated to make it update the canvas when switching tool options (as opposed to just the selection))
		// I'm having it use the tool_transparent_mode option here, so you could at least choose beforehand
		// (and this might actually give you more options, although it could be confusingly inconsistent)
		// @FIXME: yeah, this is confusing; if you have both transparency modes on and you try to clear an area to transparency, it doesn't work
		// and there's no indication that you should try the other selection transparency mode,
		// and even if you do, if you do it after creating a selection, it still won't work,
		// because you will have already *not cut out* the selection from the canvas
		if (!transparency || tool_transparent_mode) {
			main_ctx.drawImage(colored_cutout, this.x, this.y);
		}

		$G.triggerHandler("session-update"); // autosave
		update_helper_layer();
	}
	update_tool_transparent_mode() {
		const sourceImageData = this.source_canvas.ctx.getImageData(0, 0, this.width, this.height);
		const cutoutImageData = this.canvas.ctx.createImageData(this.width, this.height);
		const background_color_rgba = get_rgba_from_color(selected_colors.background);
		// NOTE: In b&w mode, mspaint treats the transparency color as white,
		// regardless of the pattern selected, even if the selected background color is pure black.
		// We allow any kind of image data while in our "b&w mode".
		// Our b&w mode is essentially 'patterns in the palette'.
		const match_threshold = 1; // 1 is just enough for a workaround for Brave browser's farbling: https://github.com/1j01/jspaint/issues/184
		for (let i = 0; i < cutoutImageData.data.length; i += 4) {
			let in_cutout = sourceImageData.data[i + 3] > 1;
			if (tool_transparent_mode) {
				// @FIXME: work with transparent selected background color
				// (support treating partially transparent background colors as transparency)
				if (
					Math.abs(sourceImageData.data[i + 0] - background_color_rgba[0]) <= match_threshold &&
					Math.abs(sourceImageData.data[i + 1] - background_color_rgba[1]) <= match_threshold &&
					Math.abs(sourceImageData.data[i + 2] - background_color_rgba[2]) <= match_threshold &&
					Math.abs(sourceImageData.data[i + 3] - background_color_rgba[3]) <= match_threshold
				) {
					in_cutout = false;
				}
			}
			if (in_cutout) {
				cutoutImageData.data[i + 0] = sourceImageData.data[i + 0];
				cutoutImageData.data[i + 1] = sourceImageData.data[i + 1];
				cutoutImageData.data[i + 2] = sourceImageData.data[i + 2];
				cutoutImageData.data[i + 3] = sourceImageData.data[i + 3];
			}
			else {
				// cutoutImageData.data[i+0] = 0;
				// cutoutImageData.data[i+1] = 0;
				// cutoutImageData.data[i+2] = 0;
				// cutoutImageData.data[i+3] = 0;
			}
		}
		this.canvas.ctx.putImageData(cutoutImageData, 0, 0);

		update_helper_layer();
	}
	// @TODO: should Image > Invert apply to this.source_canvas or to this.canvas (replacing this.source_canvas with the result)?
	replace_source_canvas(new_source_canvas) {
		this.source_canvas = new_source_canvas;
		const new_canvas = make_canvas(new_source_canvas);
		$(this.canvas).replaceWith(new_canvas);
		this.canvas = new_canvas;
		const center_x = this.x + this.width / 2;
		const center_y = this.y + this.height / 2;
		const new_width = new_canvas.width;
		const new_height = new_canvas.height;
		// NOTE: flooring the coordinates to integers avoids blurring
		// but it introduces "inching", where the selection can move along by pixels if you rotate it repeatedly
		// could introduce an "error offset" just to avoid this but that seems overkill
		// and then that would be weird hidden behavior, probably not worth it
		// Math.round() might make it do it on fewer occasions(?),
		// but then it goes down *and* to the right, 2 directions vs One Direction
		// and Math.ceil() is the worst of both worlds
		this.x = ~~(center_x - new_width / 2);
		this.y = ~~(center_y - new_height / 2);
		this.width = new_width;
		this.height = new_height;
		this.position();
		$(this.canvas).on("pointerdown", this.canvas_pointerdown);
		this.$el.triggerHandler("resize"); //?
		this.update_tool_transparent_mode();
	}
	resize() {
		const new_source_canvas = make_canvas(this.width, this.height);
		new_source_canvas.ctx.drawImage(this.source_canvas, 0, 0, this.width, this.height);
		this.replace_source_canvas(new_source_canvas);
	}
	scale(factor) {
		const new_width = Math.max(1, this.width * factor);
		const new_height = Math.max(1, this.height * factor);
		const new_source_canvas = make_canvas(new_width, new_height);
		new_source_canvas.ctx.drawImage(this.source_canvas, 0, 0, new_source_canvas.width, new_source_canvas.height);
		this.replace_source_canvas(new_source_canvas);
	}
	draw() {
		try {
			main_ctx.drawImage(this.canvas, this.x, this.y);
		}
		// eslint-disable-next-line no-empty
		catch (e) { }
	}
	destroy() {
		super.destroy();
		$G.off("option-changed", this._on_option_changed);
		update_helper_layer(); // @TODO: under-grid specific helper layer?
	}
}
