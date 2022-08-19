((exports) => {

	function $FontBox() {
		const $fb = $(E("div")).addClass("font-box");

		const $family = $(E("select")).addClass("inset-deep").attr({
			"aria-label": "Font Family",
			"aria-description": localize("Selects the font used by the text."),
		});
		const $size = $(E("input")).addClass("inset-deep").attr({
			type: "number",
			min: 8,
			max: 72,
			value: text_tool_font.size,
			"aria-label": "Font Size",
			"aria-description": localize("Selects the point size of the text."),
		}).css({
			maxWidth: 50,
		});
		const $button_group = $(E("span")).addClass("text-toolbar-button-group");
		// @TODO: localized labels
		const $bold = $Toggle(0, "bold", "Bold", localize("Sets or clears the text bold attribute."));
		const $italic = $Toggle(1, "italic", "Italic", localize("Sets or clears the text italic attribute."));
		const $underline = $Toggle(2, "underline", "Underline", localize("Sets or clears the text underline attribute."));
		const $vertical = $Toggle(3, "vertical", "Vertical Writing Mode", localize("Only a Far East font can be used for vertical editing."));
		$vertical.attr("disabled", true);

		$button_group.append($bold, $italic, $underline, $vertical);
		$fb.append($family, $size, $button_group);

		const update_font = () => {
			text_tool_font.size = Number($size.val());
			text_tool_font.family = $family.val();
			$G.trigger("option-changed");
		};

		FontDetective.each(font => {
			const $option = $(E("option"));
			$option.val(font).text(font.name);
			$family.append($option);
			if (!text_tool_font.family) {
				update_font();
			}
		});

		if (text_tool_font.family) {
			$family.val(text_tool_font.family);
		}

		$family.on("change", update_font);
		$size.on("change", update_font);

		const $w = $ToolWindow();
		$w.title(localize("Fonts"));
		$w.$content.append($fb);
		$w.center();
		return $w;


		function $Toggle(xi, thing, label, description) {
			const $button = $(E("button")).addClass("toggle").attr({
				"aria-pressed": false,
				"aria-label": label,
				"aria-description": description,
			});
			const $icon = $(E("span")).addClass("icon").appendTo($button);
			$button.css({
				width: 23,
				height: 22,
				padding: 0,
				display: "inline-flex",
				alignContent: "center",
				alignItems: "center",
				justifyContent: "center",
			});
			$icon.css({
				flex: "0 0 auto",
				display: "block",
				width: 16,
				height: 16,
				"--icon-index": xi,
			});
			$button.on("click", () => {
				$button.toggleClass("selected");
				text_tool_font[thing] = $button.hasClass("selected");
				$button.attr("aria-pressed", $button.hasClass("selected"));
				update_font();
			});
			if (text_tool_font[thing]) {
				$button.addClass("selected").attr("aria-pressed", true);
			}
			return $button;
		}
	}

	exports.$FontBox = $FontBox;

})(window);