((exports) => {
	const default_theme = "classic.css";
	const theme_storage_key = "jspaint theme";
	const disable_seasonal_theme_key = "jspaint disable seasonal theme";
	const href_for = theme => `styles/themes/${theme}`;

	let iid;
	function wait_for_theme_loaded(theme, callback) {
		clearInterval(iid);
		iid = setInterval(() => {
			const theme_loaded =
				getComputedStyle(document.documentElement)
					.getPropertyValue("--theme-loaded")
					.replace(/['"]+/g, "").trim();
			if (theme_loaded === theme) {
				clearInterval(iid);
				callback();
			}
		}, 15);
	}

	let grinch_button;
	let current_theme;
	try {
		const grinch = localStorage[disable_seasonal_theme_key] === "true";
		const is_december = new Date().getMonth() === 11;
		if (is_december && !grinch) {
			current_theme = "winter.css"; // overriding theme preference until you disable the seasonal theme
			wait_for_theme_loaded(current_theme, () => { // could just wait for DOM to load, but theme is needed for the button styling
				make_grinch_button();
			});
		} else {
			current_theme = localStorage[theme_storage_key] || default_theme;
		}
	} catch (error) {
		console.error(error);
		current_theme = default_theme;
	}

	const theme_link = document.createElement("link");
	theme_link.rel = "stylesheet";
	theme_link.type = "text/css";
	theme_link.href = href_for(current_theme);
	theme_link.id = "theme-link";
	document.head.appendChild(theme_link);

	update_not_for_modern_theme();

	exports.get_theme = () => current_theme;

	exports.set_theme = theme => {
		current_theme = theme;

		try {
			localStorage[theme_storage_key] = theme;
			localStorage[disable_seasonal_theme_key] = "true"; // any theme change disables seasonal theme (unless of course you select the seasonal theme)
			grinch_button?.remove();
			// eslint-disable-next-line no-empty
		} catch (error) { }

		const signal_theme_load = () => {
			$(window).triggerHandler("theme-load");
			$(window).trigger("resize"); // not exactly, but get dynamic cursor to update its offset
		};

		wait_for_theme_loaded(theme, signal_theme_load);
		theme_link.href = href_for(theme);

		update_not_for_modern_theme();

		signal_theme_load();
	};

	function update_not_for_modern_theme() {
		const not_for_modern = document.querySelectorAll("link.not-for-modern");
		for (const link of not_for_modern) {
			link.disabled = current_theme === "modern.css";
		}
	}

	function make_grinch_button() {
		const button = document.createElement("button");
		button.ariaLabel = "Disable seasonal theme";
		button.className = "grinch-button";
		let clicked = false;
		let smile = 0;
		let momentum = 0;
		let smile_target = 0;
		let anim_id;
		const num_frames = 38;
		const frame_width = 100;
		button.onclick = () => {
			if (smile === smile_target) {
				steal_christmas();
			}
			clicked = true;
		};
		button.onmouseleave = () => {
			smile_target = clicked ? 1 : 0;
			animate();
			document.removeEventListener('touchmove', document_touchmove);
		};
		button.onmouseenter = () => {
			smile_target = 1;
			momentum = Math.max(momentum, 0.02); // for the immediacy of the hover effect
			animate();
		};
		button.onpointerdown = (event) => {
			if (event.pointerType === "touch") {
				button.onmouseenter();
				document.addEventListener('touchmove', document_touchmove);
			}
		};
		// Not using pointerleave because it includes when the finger is lifted off the screen
		// Maybe it would be easier to detect that case with event.button(s) though.
		function document_touchmove(event) {
			var touch = event.touches[0];
			if (button !== document.elementFromPoint(touch.pageX, touch.pageY)) {
				// finger left the button
				clicked = false;
				button.onmouseleave();
			}
		}

		function animate() {
			cancelAnimationFrame(anim_id);
			smile += momentum * 0.5;
			momentum *= 0.9; // set to 0.99 to test smile getting stuck (should be fixed)
			if (smile_target) {
				momentum += 0.001;
			} else {
				if (smile < 0.4) {
					momentum -= 0.0005; // slowing down the last bit of un-smiling (feels more natural; I wish there were more frames though)
				} else {
					momentum -= 0.001;
				}
			}
			if (smile > 1) {
				smile = 1;
				momentum = 0;
				if (clicked) {
					steal_christmas();
				}
			} else if (smile < 0) {
				smile = 0;
				momentum = 0;
			}
			if (smile !== smile_target) {
				anim_id = requestAnimationFrame(animate);
			}
			button.style.backgroundPosition = `${-Math.floor(smile * (num_frames - 1)) * frame_width}px 0px`;
		}
		function on_zoom_etc() {
			// scale to nearest pixel-perfect size
			button.style.transform = `scale(${Math.max(1, Math.floor(devicePixelRatio)) / devicePixelRatio})`;
			button.style.transformOrigin = "bottom right";
			button.style.imageRendering = "pixelated";
		}
		window.addEventListener("resize", on_zoom_etc);
		on_zoom_etc();
		function steal_christmas() {
			let new_theme;
			try {
				localStorage[disable_seasonal_theme_key] = "true";
				new_theme = localStorage[theme_storage_key] || default_theme;
				// eslint-disable-next-line no-empty
			} catch (error) { }
			if (new_theme === "winter.css") {
				new_theme = default_theme;
			}
			set_theme(new_theme);
			button.remove();
			window.removeEventListener("resize", on_zoom_etc);
			document.removeEventListener('touchmove', document_touchmove);
		}
		document.body.appendChild(button);
		grinch_button = button;
	}
})(window);
