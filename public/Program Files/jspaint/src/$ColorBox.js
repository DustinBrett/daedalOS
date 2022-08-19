((exports) => {

	/** Used by the Colors Box and by the Edit Colors dialog */
	function $Swatch(color) {
		const $swatch = $(E("div")).addClass("swatch");
		const swatch_canvas = make_canvas();
		$(swatch_canvas).css({ pointerEvents: "none" }).appendTo($swatch);

		// @TODO: clean up event listener
		$G.on("theme-load", () => { update_$swatch($swatch); });
		$swatch.data("swatch", color);
		update_$swatch($swatch, color);

		return $swatch;
	}

	function update_$swatch($swatch, new_color) {
		if (new_color instanceof CanvasPattern) {
			$swatch.addClass("pattern");
			$swatch[0].dataset.color = "";
		} else if (typeof new_color === "string") {
			$swatch.removeClass("pattern");
			$swatch[0].dataset.color = new_color;
		} else if (new_color !== undefined) {
			throw new TypeError(`argument to update must be CanvasPattern or string (or undefined); got type ${typeof new_color}`);
		}
		new_color = new_color || $swatch.data("swatch");
		$swatch.data("swatch", new_color);
		const swatch_canvas = $swatch.find("canvas")[0];
		requestAnimationFrame(() => {
			swatch_canvas.width = $swatch.innerWidth();
			swatch_canvas.height = $swatch.innerHeight();
			if (new_color) {
				swatch_canvas.ctx.fillStyle = new_color;
				swatch_canvas.ctx.fillRect(0, 0, swatch_canvas.width, swatch_canvas.height);
			}
		});
	}

	function $ColorBox(vertical) {
		const $cb = $(E("div")).addClass("color-box");

		const $current_colors = $Swatch(selected_colors.ternary).addClass("current-colors");
		const $palette = $(E("div")).addClass("palette");

		$cb.append($current_colors, $palette);

		const $foreground_color = $Swatch(selected_colors.foreground).addClass("color-selection foreground-color");
		const $background_color = $Swatch(selected_colors.background).addClass("color-selection background-color");
		$current_colors.append($background_color, $foreground_color);

		$G.on("option-changed", () => {
			update_$swatch($foreground_color, selected_colors.foreground);
			update_$swatch($background_color, selected_colors.background);
			update_$swatch($current_colors, selected_colors.ternary);
		});

		$current_colors.on("pointerdown", () => {
			const new_bg = selected_colors.foreground;
			selected_colors.foreground = selected_colors.background;
			selected_colors.background = new_bg;
			$G.triggerHandler("option-changed");
		});

		const make_color_button = (color) => {

			const $b = $Swatch(color).addClass("color-button");
			$b.appendTo($palette);

			const double_click_period_ms = 400;
			let within_double_click_period = false;
			let double_click_button = null;
			let double_click_tid;
			// @TODO: handle left+right click at same time
			// can do this with mousedown instead of pointerdown, but may need to improve eye gaze mode click simulation
			$b.on("pointerdown", e => {
				// @TODO: allow metaKey for ternary color, and selection cropping, on macOS?
				ctrl = e.ctrlKey;
				button = e.button;
				if (button === 0) {
					$c.data("$last_fg_color_button", $b);
				}

				const color_selection_slot = ctrl ? "ternary" : button === 0 ? "foreground" : button === 2 ? "background" : null;
				if (color_selection_slot) {
					if (within_double_click_period && button === double_click_button) {
						show_edit_colors_window($b, color_selection_slot);
					} else {
						selected_colors[color_selection_slot] = $b.data("swatch");
						$G.trigger("option-changed");
					}

					clearTimeout(double_click_tid);
					double_click_tid = setTimeout(() => {
						within_double_click_period = false;
						double_click_button = null;
					}, double_click_period_ms);
					within_double_click_period = true;
					double_click_button = button;
				}
			});
		};

		const build_palette = () => {
			$palette.empty();

			palette.forEach(make_color_button);

			// Note: this doesn't work until the colors box is in the DOM
			const $some_button = $palette.find(".color-button");
			if (vertical) {
				const height_per_button =
					$some_button.outerHeight() +
					parseFloat(getComputedStyle($some_button[0]).getPropertyValue("margin-top")) +
					parseFloat(getComputedStyle($some_button[0]).getPropertyValue("margin-bottom"));
				$palette.height(Math.ceil(palette.length / 2) * height_per_button);
			} else {
				const width_per_button =
					$some_button.outerWidth() +
					parseFloat(getComputedStyle($some_button[0]).getPropertyValue("margin-left")) +
					parseFloat(getComputedStyle($some_button[0]).getPropertyValue("margin-right"));
				$palette.width(Math.ceil(palette.length / 2) * width_per_button);
			}

			// the "last foreground color button" starts out as the first in the palette
			$c.data("$last_fg_color_button", $palette.find(".color-button:first-child"));
		};
		let $c;
		if (vertical) {
			$c = $Component(localize("Colors"), "colors-component", "tall", $cb);
			$c.appendTo(get_direction() === "rtl" ? $left : $right); // opposite ToolBox by default
		} else {
			$c = $Component(localize("Colors"), "colors-component", "wide", $cb);
			$c.appendTo($bottom);
		}

		build_palette();
		$(window).on("theme-change", build_palette);

		$c.rebuild_palette = build_palette;

		return $c;
	}

	exports.$ColorBox = $ColorBox;
	exports.$Swatch = $Swatch;
	exports.update_$swatch = update_$swatch;

})(window);