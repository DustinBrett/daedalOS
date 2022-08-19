
class OnCanvasObject {
	constructor(x, y, width, height, hideMainCanvasHandles) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.hideMainCanvasHandles = hideMainCanvasHandles;
		this.$el = $(E("div")).addClass("on-canvas-object").appendTo($canvas_area);
		if (this.hideMainCanvasHandles) {
			canvas_handles.hide();
		}
		$G.on("resize theme-load", this._global_resize_handler = () => {
			this.position();
		});
	}
	position(updateStatus) {
		// Nevermind, canvas, isn't aligned to the right in RTL layout!
		// const direction = get_direction();
		// const left_for_ltr = direction === "rtl" ? "right" : "left";
		// const offset_left = parseFloat($canvas_area.css(`padding-${left_for_ltr}`));
		const offset_left = parseFloat($canvas_area.css(`padding-left`));
		const offset_top = parseFloat($canvas_area.css("padding-top"));
		this.$el.css({
			position: "absolute",
			// [left_for_ltr]: magnification * (direction === "rtl" ? canvas.width - this.width - this.x : this.x) + offset_left,
			left: magnification * this.x + offset_left,
			top: magnification * this.y + offset_top,
			width: magnification * this.width,
			height: magnification * this.height,
		});
		if (updateStatus) {
			$status_position.text(`${this.x},${this.y}`);
			$status_size.text(`${this.width},${this.height}`);
		}
	}
	destroy() {
		this.$el.remove();
		if (this.hideMainCanvasHandles) {
			canvas_handles.show();
		}
		$G.off("resize theme-load", this._global_resize_handler);
	}
}
