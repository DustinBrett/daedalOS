
function Handles(options) {
	const { $handles_container, $object_container } = options; // required
	const outset = options.outset || 0;
	const get_handles_offset_left = options.get_handles_offset_left || (() => 0);
	const get_handles_offset_top = options.get_handles_offset_top || (() => 0);
	const get_ghost_offset_left = options.get_ghost_offset_left || (() => 0);
	const get_ghost_offset_top = options.get_ghost_offset_top || (() => 0);
	const size_only = options.size_only || false;

	const HANDLE_MIDDLE = 0;
	const HANDLE_START = -1;
	const HANDLE_END = 1;
	const HANDLE_LEFT = HANDLE_START;
	const HANDLE_RIGHT = HANDLE_END;
	const HANDLE_TOP = HANDLE_START;
	const HANDLE_BOTTOM = HANDLE_END;

	const $resize_ghost = $(E("div")).addClass("resize-ghost");
	if (options.thick) {
		$resize_ghost.addClass("thick");
	}
	const handles = [];
	[
		[HANDLE_TOP, HANDLE_RIGHT], // ↗
		[HANDLE_TOP, HANDLE_MIDDLE], // ↑
		[HANDLE_TOP, HANDLE_LEFT], // ↖
		[HANDLE_MIDDLE, HANDLE_LEFT], // ←
		[HANDLE_BOTTOM, HANDLE_LEFT], // ↙
		[HANDLE_BOTTOM, HANDLE_MIDDLE], // ↓
		[HANDLE_BOTTOM, HANDLE_RIGHT], // ↘
		[HANDLE_MIDDLE, HANDLE_RIGHT], // →
	].forEach(([y_axis, x_axis]) => {
		const $h = $(E("div")).addClass("handle");
		$h.appendTo($handles_container);
		const $grab_region = $(E("div")).addClass("grab-region").appendTo($handles_container);
		if (y_axis === HANDLE_MIDDLE || x_axis === HANDLE_MIDDLE) {
			$grab_region.addClass("is-middle");
		}

		$h.css("touch-action", "none");

		let rect;
		let dragged = false;
		const resizes_height = y_axis !== HANDLE_MIDDLE;
		const resizes_width = x_axis !== HANDLE_MIDDLE;
		if (size_only && (y_axis === HANDLE_TOP || x_axis === HANDLE_LEFT)) {
			$h.addClass("useless-handle");
			$grab_region.remove();
		} else {

			let cursor_fname;
			if ((x_axis === HANDLE_LEFT && y_axis === HANDLE_TOP) || (x_axis === HANDLE_RIGHT && y_axis === HANDLE_BOTTOM)) {
				cursor_fname = "nwse-resize";
			} else if ((x_axis === HANDLE_RIGHT && y_axis === HANDLE_TOP) || (x_axis === HANDLE_LEFT && y_axis === HANDLE_BOTTOM)) {
				cursor_fname = "nesw-resize";
			} else if (resizes_width) {
				cursor_fname = "ew-resize";
			} else if (resizes_height) {
				cursor_fname = "ns-resize";
			}

			let fallback_cursor = "";
			if (y_axis === HANDLE_TOP) { fallback_cursor += "n"; }
			if (y_axis === HANDLE_BOTTOM) { fallback_cursor += "s"; }
			if (x_axis === HANDLE_LEFT) { fallback_cursor += "w"; }
			if (x_axis === HANDLE_RIGHT) { fallback_cursor += "e"; }

			fallback_cursor += "-resize";
			const cursor = make_css_cursor(cursor_fname, [16, 16], fallback_cursor);
			$h.add($grab_region).css({ cursor });

			const drag = (event) => {
				$resize_ghost.appendTo($object_container);
				dragged = true;

				rect = options.get_rect();
				const m = to_canvas_coords(event);
				let delta_x = 0;
				let delta_y = 0;
				let width, height;
				// @TODO: decide between Math.floor/Math.ceil/Math.round for these values
				if (x_axis === HANDLE_RIGHT) {
					delta_x = 0;
					width = ~~(m.x - rect.x);
				} else if (x_axis === HANDLE_LEFT) {
					delta_x = ~~(m.x - rect.x);
					width = ~~(rect.x + rect.width - m.x);
				} else {
					width = ~~(rect.width);
				}
				if (y_axis === HANDLE_BOTTOM) {
					delta_y = 0;
					height = ~~(m.y - rect.y);
				} else if (y_axis === HANDLE_TOP) {
					delta_y = ~~(m.y - rect.y);
					height = ~~(rect.y + rect.height - m.y);
				} else {
					height = ~~(rect.height);
				}
				let new_rect = {
					x: rect.x + delta_x,
					y: rect.y + delta_y,
					width: width,
					height: height,
				};

				new_rect.width = Math.max(1, new_rect.width);
				new_rect.height = Math.max(1, new_rect.height);

				if (options.constrain_rect) {
					new_rect = options.constrain_rect(new_rect, x_axis, y_axis);
				} else {
					new_rect.x = Math.min(new_rect.x, rect.x + rect.width);
					new_rect.y = Math.min(new_rect.y, rect.y + rect.height);
				}

				$resize_ghost.css({
					position: "absolute",
					left: magnification * new_rect.x + get_ghost_offset_left(),
					top: magnification * new_rect.y + get_ghost_offset_top(),
					width: magnification * new_rect.width - 2,
					height: magnification * new_rect.height - 2,
				});
				rect = new_rect;
			};
			$h.add($grab_region).on("pointerdown", event => {
				dragged = false;
				if (event.button === 0) {
					$G.on("pointermove", drag);
					$("body").css({ cursor }).addClass("cursor-bully");
				}
				$G.one("pointerup", () => {
					$G.off("pointermove", drag);
					$("body").css({ cursor: "" }).removeClass("cursor-bully");

					$resize_ghost.remove();
					if (dragged) {
						options.set_rect(rect);
					}
					$handles_container.trigger("update");
				});
			});
			$h.on("mousedown selectstart", event => {
				event.preventDefault();
			});
		}

		const update_handle = () => {
			const rect = options.get_rect();
			const hs = $h.width();
			// const x = rect.x + get_handles_offset_left();
			// const y = rect.y + get_handles_offset_top();
			const x = get_handles_offset_left();
			const y = get_handles_offset_top();
			const grab_size = 32;
			for ({ len_key, pos_key, region, offset } of [
				{ len_key: "width", pos_key: "left", region: x_axis, offset: x },
				{ len_key: "height", pos_key: "top", region: y_axis, offset: y },
			]) {
				let middle_start = Math.max(
					rect[len_key] * magnification / 2 - grab_size / 2,
					Math.min(
						grab_size / 2,
						rect[len_key] * magnification / 3
					)
				);
				let middle_end = rect[len_key] * magnification - middle_start;
				if (middle_end - middle_start < magnification) {
					// give middle region min size of one (1) canvas pixel
					middle_start = 0;
					middle_end = magnification;
				}
				const start_start = -grab_size / 2;
				const start_end = Math.min(
					grab_size / 2,
					middle_start
				);
				const end_start = rect[len_key] * magnification - start_end;
				const end_end = rect[len_key] * magnification - start_start;
				if (size_only) {
					// For main canvas handles, where only the right/bottom handles are interactive,
					// extend the middle regions left/up into the unused space of the useless handles.
					// (This must be after middle_start is used above.)
					middle_start = Math.max(-offset, Math.min(middle_start, middle_end - grab_size));
				}
				if (region === HANDLE_START) {
					$h.css({ [pos_key]: offset - outset });
					$grab_region.css({
						[pos_key]: offset + start_start,
						[len_key]: start_end - start_start,
					});
				} else if (region === HANDLE_MIDDLE) {
					$h.css({ [pos_key]: offset + (rect[len_key] * magnification - hs) / 2 });
					$grab_region.css({
						[pos_key]: offset + middle_start,
						[len_key]: middle_end - middle_start,
					});
				} else if (region === HANDLE_END) {
					$h.css({ [pos_key]: offset + (rect[len_key] * magnification - hs / 2) });
					$grab_region.css({
						[pos_key]: offset + end_start,
						[len_key]: end_end - end_start,
					});
				}
			}
		};

		$handles_container.on("update resize scroll", update_handle);
		$G.on("resize theme-load", update_handle);
		setTimeout(update_handle, 50);

		handles.push($h[0], $grab_region[0]);
	});

	this.handles = handles;

	// It shouldn't scroll when hiding/showing handles, so don't use jQuery hide/show or CSS display.
	this.hide = () => { $(handles).css({ opacity: 0, pointerEvents: "none" }); };
	this.show = () => { $(handles).css({ opacity: "", pointerEvents: "" }); };
}
