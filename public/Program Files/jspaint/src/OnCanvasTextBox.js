
class OnCanvasTextBox extends OnCanvasObject {
	constructor(x, y, width, height, starting_text) {
		super(x, y, width, height, true);

		this.$el.addClass("textbox");
		this.$editor = $(E("textarea")).addClass("textbox-editor");

		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("version", 1.1);
		var foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
		foreignObject.setAttribute("x", 0);
		foreignObject.setAttribute("y", 0);
		svg.append(foreignObject);

		// inline styles so that they'll be serialized for the SVG
		this.$editor.css({
			position: "absolute",
			left: "0",
			top: "0",
			right: "0",
			bottom: "0",
			padding: "0",
			margin: "0",
			border: "0",
			resize: "none",
			overflow: "hidden",
			minWidth: "3em",
		});
		var edit_textarea = this.$editor[0];
		var render_textarea = edit_textarea.cloneNode(false);
		foreignObject.append(render_textarea);

		edit_textarea.value = starting_text || "";

		this.canvas = make_canvas(width, height);
		this.canvas.style.pointerEvents = "none";
		this.$el.append(this.canvas);

		const update_size = () => {
			this.position();
			this.$el.triggerHandler("update"); // update handles
			this.$editor.add(render_textarea).css({
				width: this.width,
				height: this.height,
			});
		};

		const auto_size = () => {
			// Auto-expand, and apply minimum size.
			edit_textarea.style.height = "";
			edit_textarea.style.minHeight = "0px";
			edit_textarea.style.bottom = ""; // needed for when magnified
			edit_textarea.setAttribute("rows", 1);
			this.height = Math.max(edit_textarea.scrollHeight, this.height);
			edit_textarea.removeAttribute("rows");
			this.width = edit_textarea.scrollWidth;
			edit_textarea.style.bottom = "0"; // doesn't seem to be needed?
			// always needs to update at least this.$editor, since style.height is reset above
			update_size();
		};

		const update = () => {
			requestAnimationFrame(() => {
				edit_textarea.scrollTop = 0; // prevent scrolling edit textarea to keep in sync
			});

			const font = text_tool_font;
			const get_solid_color = (swatch) => `rgba(${get_rgba_from_color(swatch).join(", ")}`;
			font.color = get_solid_color(selected_colors.foreground);
			font.background = tool_transparent_mode ? "transparent" : get_solid_color(selected_colors.background);
			this.$editor.add(this.canvas).css({
				transform: `scale(${magnification})`,
				transformOrigin: "left top",
			});
			this.$editor.add(render_textarea).css({
				width: this.width,
				height: this.height,
				fontFamily: font.family,
				fontSize: `${font.size}pt`,
				fontWeight: font.bold ? "bold" : "normal",
				fontStyle: font.italic ? "italic" : "normal",
				textDecoration: font.underline ? "underline" : "none",
				writingMode: font.vertical ? "vertical-lr" : "",
				MsWritingMode: font.vertical ? "vertical-lr" : "",
				WebkitWritingMode: font.vertical ? "vertical-lr" : "",
				lineHeight: `${font.size * font.line_scale}px`,
				color: font.color,
				background: font.background,
			});

			// Must be after font is updated, since the minimum size depends on the font size.
			auto_size();

			while (render_textarea.firstChild) {
				render_textarea.removeChild(render_textarea.firstChild);
			}
			render_textarea.appendChild(document.createTextNode(edit_textarea.value));

			svg.setAttribute("width", this.width);
			svg.setAttribute("height", this.height);
			foreignObject.setAttribute("width", this.width);
			foreignObject.setAttribute("height", this.height);

			var svg_source = new XMLSerializer().serializeToString(svg);
			var data_url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg_source)}`;

			var img = new Image();
			img.onload = () => {
				this.canvas.width = this.width;
				this.canvas.height = this.height;
				this.canvas.ctx.drawImage(img, 0, 0);
				update_helper_layer(); // @TODO: under-grid specific helper layer?
			};
			img.onerror = (event) => {
				window.console && console.log("Failed to load image", event);
			};
			img.src = data_url;
		};

		$G.on("option-changed", this._on_option_changed = update);
		this.$editor.on("input", this._on_input = update);
		this.$editor.on("scroll", this._on_scroll = () => {
			requestAnimationFrame(() => {
				edit_textarea.scrollTop = 0; // prevent scrolling edit textarea to keep in sync
			});
		});

		this.$el.css({
			cursor: make_css_cursor("move", [8, 8], "move"),
			touchAction: "none",
		});
		this.position();

		this.$el.append(this.$editor);
		this.$editor[0].focus();
		this.handles = new Handles({
			$handles_container: this.$el,
			$object_container: $canvas_area,
			outset: 2,
			thick: true,
			get_rect: () => ({ x: this.x, y: this.y, width: this.width, height: this.height }),
			set_rect: ({ x, y, width, height }) => {
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
				this.position();
				update();
				// clear canvas to avoid an occasional flash of the old canvas (with old size) in the new position
				// (trade it off for a flash of the background behind the textbox)
				this.canvas.width = width;
				this.canvas.height = height;
			},
			constrain_rect: ({ x, y, width, height }, x_axis, y_axis) => {
				// remember dimensions
				const old_x = this.x;
				const old_y = this.y;
				const old_width = this.width;
				const old_height = this.height;

				// apply prospective new dimensions
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
				update_size();

				// apply constraints
				auto_size();

				// prevent free movement via resize
				if (x_axis === -1) {
					x = Math.min(this.x, old_x + old_width - this.width);
				}
				if (y_axis === -1) {
					y = Math.min(this.y, old_y + old_height - this.height);
				}

				// remember constrained dimensions
				width = this.width;
				height = this.height;

				// reset
				this.x = old_x;
				this.y = old_y;
				this.width = old_width;
				this.height = old_height;
				update_size();

				return { x, y, width, height };
			},
			get_ghost_offset_left: () => parseFloat($canvas_area.css("padding-left")) + 1,
			get_ghost_offset_top: () => parseFloat($canvas_area.css("padding-top")) + 1,
		});
		let mox, moy; // mouse offset
		const pointermove = e => {
			const m = to_canvas_coords(e);
			this.x = Math.max(Math.min(m.x - mox, main_canvas.width), -this.width);
			this.y = Math.max(Math.min(m.y - moy, main_canvas.height), -this.height);
			this.position();
			if (e.shiftKey) {
				// @TODO: maybe re-enable but handle undoables well
				// this.draw();
			}
		};
		this.$el.on("pointerdown", e => {
			if (e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement ||
				e.target.classList.contains("handle") ||
				e.target.classList.contains("grab-region")) {
				return;
			}
			e.preventDefault();
			const rect = this.$el[0].getBoundingClientRect();
			const cx = e.clientX - rect.left;
			const cy = e.clientY - rect.top;
			mox = ~~(cx / rect.width * this.canvas.width);
			moy = ~~(cy / rect.height * this.canvas.height);
			this.dragging = true;
			update_helper_layer(); // for thumbnail, which draws textbox outline if it's not being dragged
			$G.on("pointermove", pointermove);
			$G.one("pointerup", () => {
				$G.off("pointermove", pointermove);
				this.dragging = false;
				update_helper_layer(); // for thumbnail, which draws textbox outline if it's not being dragged
			});
		});
		$status_position.text("");
		$status_size.text("");
		$canvas_area.trigger("resize"); // to update handles, get them to hide?

		if (OnCanvasTextBox.$fontbox && OnCanvasTextBox.$fontbox.closed) {
			OnCanvasTextBox.$fontbox = null;
		}
		const $fb = OnCanvasTextBox.$fontbox = OnCanvasTextBox.$fontbox || new $FontBox();
		const displace_font_box = () => {
			// move the font box out of the way if it's overlapping the OnCanvasTextBox
			const fb_rect = $fb[0].getBoundingClientRect();
			const tb_rect = this.$el[0].getBoundingClientRect();
			if (
				// the fontbox overlaps textbox
				fb_rect.left <= tb_rect.right &&
				tb_rect.left <= fb_rect.right &&
				fb_rect.top <= tb_rect.bottom &&
				tb_rect.top <= fb_rect.bottom
			) {
				// move the font box out of the way
				$fb.css({
					top: this.$el.position().top - $fb.height()
				});
			}
			$fb.applyBounds();
		};

		// must be after textbox is in the DOM
		update();

		displace_font_box();

		// In case a software keyboard opens, like Optikey for eye gaze / head tracking users,
		// or perhaps a handwriting input for pen tablet users, or *partially* for mobile browsers.
		// Mobile browsers generally scroll the view for a textbox well enough, but
		// don't include the custom behavior of moving the font box out of the way.
		$(window).on("resize", this._on_window_resize = () => {
			this.$editor[0].scrollIntoView({ block: 'nearest', inline: 'nearest' });
			displace_font_box();
		});
	}
	position() {
		super.position(true);
		update_helper_layer(); // @TODO: under-grid specific helper layer?
	}
	destroy() {
		super.destroy();
		if (OnCanvasTextBox.$fontbox && !OnCanvasTextBox.$fontbox.closed) {
			OnCanvasTextBox.$fontbox.close();
		}
		OnCanvasTextBox.$fontbox = null;
		$G.off("option-changed", this._on_option_changed);
		this.$editor.off("input", this._on_input);
		this.$editor.off("scroll", this._on_scroll);
		$(window).off("resize", this._on_window_resize);
		update_helper_layer(); // @TODO: under-grid specific helper layer?
	}
}
