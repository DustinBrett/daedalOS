((exports) => {

	let theme_dev_blob_url;

	function $ToolBox(tools, is_extras) {
		const $tools = $(E("div")).addClass("tools");
		const $tool_options = $(E("div")).addClass("tool-options");

		let showing_tooltips = false;
		$tools.on("pointerleave", () => {
			showing_tooltips = false;
			$status_text.default();
		});

		const $buttons = $($.map(tools, (tool, i) => {
			const $b = $(E("div")).addClass("tool");
			$b.appendTo($tools);
			tool.$button = $b;

			$b.attr("title", tool.name);

			const $icon = $(E("span")).addClass("tool-icon");
			$icon.appendTo($b);
			const update_css = () => {
				const use_svg = !theme_dev_blob_url && (
					(
						(window.devicePixelRatio >= 3 || (window.devicePixelRatio % 1) !== 0)
					) ||
					$("body").hasClass("eye-gaze-mode")
				);
				$icon.css({
					display: "block",
					position: "absolute",
					left: 4,
					top: 4,
					width: 16,
					height: 16,
					backgroundImage: theme_dev_blob_url ? `url(${theme_dev_blob_url})` : "",
					"--icon-index": i,
				});
				$icon.toggleClass("use-svg", use_svg);
			};
			update_css();
			$G.on("theme-load resize", update_css);

			$b.on("click", e => {
				if (e.shiftKey || e.ctrlKey) {
					select_tool(tool, true);
					return;
				}
				if (selected_tool === tool && tool.deselect) {
					select_tools(return_to_tools);
				} else {
					select_tool(tool);
				}
			});

			$b.on("pointerenter", () => {
				const show_tooltip = () => {
					showing_tooltips = true;
					$status_text.text(tool.description);
				};
				if (showing_tooltips) {
					show_tooltip();
				} else {
					const tid = setTimeout(show_tooltip, 300);
					$b.on("pointerleave", () => {
						clearTimeout(tid);
					});
				}
			});

			return $b[0];
		}));

		const $c = $Component(
			is_extras ? "Extra Tools" : localize("Tools"),
			is_extras ? "tools-component extra-tools-component" : "tools-component",
			"tall",
			$tools.add($tool_options)
		);
		$c.appendTo(get_direction() === "rtl" ? $right : $left); // opposite ColorBox by default
		$c.update_selected_tool = () => {
			$buttons.removeClass("selected");
			selected_tools.forEach((selected_tool) => {
				selected_tool.$button.addClass("selected");
			});
			$tool_options.children().detach();
			$tool_options.append(selected_tool.$options);
			$tool_options.children().trigger("update");
			$canvas.css({
				cursor: make_css_cursor(...selected_tool.cursor),
			});
		};
		$c.update_selected_tool();

		if (is_extras) {
			$c.height(80);
		}

		return $c;
	}

	let dev_theme_tool_icons = false;
	try {
		dev_theme_tool_icons = localStorage.dev_theme_tool_icons === "true";
		// eslint-disable-next-line no-empty
	} catch (e) { }
	if (dev_theme_tool_icons) {
		let last_update_id = 0;
		$G.on("session-update", () => {
			last_update_id += 1;
			const this_update_id = last_update_id;
			main_canvas.toBlob((blob) => {
				// avoid a race condition particularly when loading the document initially when the default canvas size is large, giving a larger PNG
				if (this_update_id !== last_update_id) {
					return;
				}
				URL.revokeObjectURL(theme_dev_blob_url);
				theme_dev_blob_url = URL.createObjectURL(blob);
				$G.triggerHandler("theme-load");
			});
		});
	}

	exports.$ToolBox = $ToolBox;

})(window);