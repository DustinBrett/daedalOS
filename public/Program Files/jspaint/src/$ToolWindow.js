((exports) => {

	function make_window_supporting_scale(options) {
		const $w = new $Window(options);

		const scale_for_eye_gaze_mode_and_center = () => {
			if (!$w.is(".edit-colors-window, .storage-manager, .attributes-window, .flip-and-rotate, .stretch-and-skew")) {
				return;
			}
			const c = $w.$content[0];
			const t = $w.$titlebar[0];
			let scale = 1;
			$w.$content.css({
				transform: `scale(${scale})`,
				transformOrigin: "0 0",
				marginRight: "",
				marginBottom: "",
			});
			if (document.body.classList.contains("eye-gaze-mode")) {
				scale = Math.min(
					(innerWidth) / c.offsetWidth,
					(innerHeight - t.offsetHeight) / c.offsetHeight
				);
				$w.$content.css({
					transform: `scale(${scale})`,
					transformOrigin: "0 0",
					marginRight: c.scrollWidth * (scale - 1),
				});
				// This is separate to prevent content going off the bottom of the window
				// in case the layout changes due to text wrapping.
				$w.$content.css({
					marginBottom: c.scrollHeight * (scale - 1),
				});
				$w.center();
			}
			// for testing (WARNING: can cause rapid flashing, which can cause seizures):
			// requestAnimationFrame(scale_for_eye_gaze_mode_and_center);
		};

		if (!options.$component) {
			$w.center();

			const scale_for_eye_gaze_mode_and_center_next_frame = () => {
				requestAnimationFrame(scale_for_eye_gaze_mode_and_center);
			};
			const on_close = () => {
				$w.off("close", on_close);
				$G.off("eye-gaze-mode-toggled resize", scale_for_eye_gaze_mode_and_center_next_frame);
			};
			$w.on("close", on_close);
			$G.on("eye-gaze-mode-toggled resize", scale_for_eye_gaze_mode_and_center_next_frame);

			scale_for_eye_gaze_mode_and_center_next_frame();
		}

		if (options.$component) {
			$w.$content.css({
				contain: "none",
			});
		}

		return $w;
	}

	function $ToolWindow($component) {
		return make_window_supporting_scale({
			$component,
			toolWindow: true,
		});
	}

	function $DialogWindow(title) {
		const $w = make_window_supporting_scale({
			title,
			resizable: false,
			maximizeButton: false,
			minimizeButton: false,
			// helpButton: @TODO
		});
		$w.addClass("dialog-window");

		$w.$form = $(E("form")).appendTo($w.$content);
		$w.$main = $(E("div")).appendTo($w.$form);
		$w.$buttons = $(E("div")).appendTo($w.$form).addClass("button-group");

		$w.$Button = (label, action) => {
			const $b = $(E("button")).appendTo($w.$buttons).text(label);
			$b.on("click", (e) => {
				// prevent the form from submitting
				// @TODO: instead, prevent the form's submit event
				e.preventDefault();

				action();
			});

			$b.on("pointerdown", () => {
				$b.focus();
			});

			return $b;
		};

		return $w;
	}

	exports.$ToolWindow = $ToolWindow;
	exports.$DialogWindow = $DialogWindow;
	exports.make_window_supporting_scale = make_window_supporting_scale;

})(window);