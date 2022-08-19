
extra_tools = [{
	name: "Airbrushbrush",
	description: "Draws randomly within a radius based on the selected Airbrush size, using a brush with the selected shape and size.",
	cursor: ["precise-dotted", [16, 16], "crosshair"],
	continuous: "time",
	rendered_color: "",
	rendered_size: 0,
	rendered_shape: "",
	paint(ctx, x, y) {
		// @XXX: copy pasted all this brush caching/rendering code!
		// @TODO: DRY!
		const csz = get_brush_canvas_size(brush_size, brush_shape);
		if (
			this.rendered_shape !== brush_shape ||
			this.rendered_color !== stroke_color ||
			this.rendered_size !== brush_size
		) {
			brush_canvas.width = csz;
			brush_canvas.height = csz;
			// don't need to do brush_ctx.disable_image_smoothing() currently because images aren't drawn to the brush

			brush_ctx.fillStyle = brush_ctx.strokeStyle = stroke_color;
			render_brush(brush_ctx, brush_shape, brush_size);

			this.rendered_color = stroke_color;
			this.rendered_size = brush_size;
			this.rendered_shape = brush_shape;
		}
		const draw_brush = (x, y) => {
			ctx.drawImage(brush_canvas, Math.ceil(x - csz / 2), Math.ceil(y - csz / 2));
		};
		const r = airbrush_size * 2;
		for (let i = 0; i < 6 + r / 5; i++) {
			const rx = (Math.random() * 2 - 1) * r;
			const ry = (Math.random() * 2 - 1) * r;
			const d = rx * rx + ry * ry;
			if (d <= r * r) {
				draw_brush(x + ~~rx, y + ~~ry);
			}
		}
	},
	$options: $choose_brush
}, {
	name: "Spirobrush",
	description: "Spirals chaotically using a brush with the selected shape and size.",
	cursor: ["precise-dotted", [16, 16], "crosshair"],
	continuous: "time",
	rendered_color: "",
	rendered_size: 0,
	rendered_shape: "",
	position: {
		x: 0,
		y: 0,
	},
	velocity: {
		x: 0,
		y: 0,
	},
	pointerdown(ctx, x, y) {
		this.position.x = x;
		this.position.y = y;
		this.velocity.x = 0;
		this.velocity.y = 0;
	},
	paint(ctx, x, y) {
		// @XXX: copy pasted all this brush caching/rendering code!
		// @TODO: DRY!
		const csz = get_brush_canvas_size(brush_size, brush_shape);
		if (
			this.rendered_shape !== brush_shape ||
			this.rendered_color !== stroke_color ||
			this.rendered_size !== brush_size
		) {
			brush_canvas.width = csz;
			brush_canvas.height = csz;
			// don't need to do brush_ctx.disable_image_smoothing() currently because images aren't drawn to the brush

			brush_ctx.fillStyle = brush_ctx.strokeStyle = stroke_color;
			render_brush(brush_ctx, brush_shape, brush_size);

			this.rendered_color = stroke_color;
			this.rendered_size = brush_size;
			this.rendered_shape = brush_shape;
		}
		const draw_brush = (x, y) => {
			ctx.drawImage(brush_canvas, Math.ceil(x - csz / 2), Math.ceil(y - csz / 2));
		};
		for (let i = 0; i < 60; i++) {
			const x_diff = x - this.position.x;
			const y_diff = y - this.position.y;
			const dist = Math.hypot(x_diff, y_diff);
			const divisor = Math.max(1, dist);
			const force_x = x_diff / divisor;
			const force_y = y_diff / divisor;
			this.velocity.x += force_x;
			this.velocity.y += force_y;
			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;
			draw_brush(this.position.x, this.position.y);
		}
	},
	$options: $choose_brush
}, {
	name: "Airbrush Options",
	description: "Lets you configure the Airbrushbrush. It uses this type of tool option as well.",
	cursor: ["airbrush", [7, 22], "crosshair"],
	continuous: "time",
	paint(ctx, x, y) {

	},
	$options: $choose_airbrush_size
}];
