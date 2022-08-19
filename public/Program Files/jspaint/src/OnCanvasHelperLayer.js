class OnCanvasHelperLayer extends OnCanvasObject {
	constructor(x, y, width, height, hideMainCanvasHandles, pixelRatio = 1) {
		super(x, y, width, height, hideMainCanvasHandles);

		this.$el.addClass("helper-layer");
		this.$el.css({
			pointerEvents: "none",
		});
		this.position();
		this.canvas = make_canvas(this.width * pixelRatio, this.height * pixelRatio);
		this.$el.append(this.canvas);
	}
}
