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

	let current_theme = default_theme;

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

})(window);
