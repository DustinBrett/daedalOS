((exports) => {

function E(nodeName, attrs) {
	const el = document.createElement(nodeName);
	if (attrs) {
		for (const key in attrs) {
			if (key === "class") {
				el.className = attrs[key];
			} else {
				el.setAttribute(key, attrs[key]);
			}
		}
	}
	return el;
}

let uid_counter = 0;
function uid() {
	// make id from counter (guaranteeing page-local uniqueness)
	// and random base 36 number (making it look random, so there's no temptation to use it as a sequence)
	// Note: Math.random().toString(36).slice(2) can give empty string
	return (uid_counter++).toString(36) + Math.random().toString(36).slice(2);
}

// @TODO: export hotkey helpers; also include one for escaping &'s (useful for dynamic menus like a list of history entries)
// also @TODO: support dynamic menus (e.g. a list of history entries, contextually shown options, or a contextually named "Undo <action>" label; Explorer has all these things)

// & defines accelerators (hotkeys) in menus and buttons and things, which get underlined in the UI.
// & can be escaped by doubling it, e.g. "&Taskbar && Start Menu"
function index_of_hotkey(text) {
	// Returns the index of the ampersand that defines a hotkey, or -1 if not present.

	// return english_text.search(/(?<!&)&(?!&|\s)/); // not enough browser support for negative lookbehind assertions

	// The space here handles beginning-of-string matching and counteracts the offset for the [^&] so it acts like a negative lookbehind
	return ` ${text}`.search(/[^&]&[^&\s]/);
}
// function has_hotkey(text) {
// 	return index_of_hotkey(text) !== -1;
// }
function remove_hotkey(text) {
	return text.replace(/\s?\(&.\)/, "").replace(/([^&]|^)&([^&\s])/, "$1$2");
}
function display_hotkey(text) {
	// TODO: use a more general term like .hotkey or .accelerator?
	return text.replace(/([^&]|^)&([^&\s])/, "$1<span class='menu-hotkey'>$2</span>").replace(/&&/g, "&");
}
function get_hotkey(text) {
	return text[index_of_hotkey(text) + 1].toUpperCase();
}

// TODO: support copy/pasting text in the text tool textarea from the menus
// probably by recording document.activeElement on pointer down,
// and restoring focus before executing menu item actions.

const MENU_DIVIDER = "MENU_DIVIDER";

const MAX_MENU_NESTING = 1000;

let internal_z_counter = 1;
function get_new_menu_z_index() {
	// integrate with the OS window z-indexes, if applicable
	// but don't depend on $Window existing, the modules should be independent
	if (typeof $Window !== "undefined") {
		return ($Window.Z_INDEX++) + MAX_MENU_NESTING; // MAX_MENU_NESTING is needed because the window gets brought to the top
	}
	return (++internal_z_counter) + MAX_MENU_NESTING;
}

function MenuBar(menus) {
	if (!(this instanceof MenuBar)) {
		return new MenuBar(menus);
	}

	const menus_el = E("div", {
		class: "menus",
		role: "menubar",
		"aria-label": "Application Menu",
	});
	menus_el.style.touchAction = "none";

	// returns writing/layout direction, "ltr" or "rtl"
	function get_direction() {
		return window.get_direction ? window.get_direction() : getComputedStyle(menus_el).direction;
	}

	let selecting_menus = false; // state where you can glide between menus without clicking

	const top_level_menus = [];
	let top_level_menu_index = -1; // index of the top level menu that's most recently open, or highlighted
	let active_menu_popup; // most nested open MenuPopup
	const menu_popup_by_el = new WeakMap(); // maps DOM elements to MenuPopup instances

	// There can be multiple menu bars instantiated from the same menu definitions,
	// so this can't be a map of menu item to submenu, it has to be of menu item ELEMENTS to submenu.
	// (or you know, it could work totally differently, this is just one way to do it)
	// This is for entering submenus.
	const submenu_popup_by_menu_item_el = new WeakMap();

	// This is for exiting submenus.
	const parent_item_el_by_popup_el = new WeakMap();

	const close_menus = () => {
		for (const { menu_button_el } of top_level_menus) {
			if (menu_button_el.getAttribute("aria-expanded") === "true") {
				menu_button_el.dispatchEvent(new CustomEvent("release"), {});
			}
		}
	};

	const refocus_window = () => {
		const window_el = menus_el.closest(".window");
		if (window_el) {
			window_el.dispatchEvent(new CustomEvent("refocus-window"));
		}
	};

	const top_level_highlight = (new_index_or_menu_key) => {
		const new_index = typeof new_index_or_menu_key === "string" ?
			Object.keys(menus).indexOf(new_index_or_menu_key) :
			new_index_or_menu_key;
		if (top_level_menu_index !== -1 && top_level_menu_index !== new_index) {
			top_level_menus[top_level_menu_index].menu_button_el.classList.remove("highlight");
			// could close the menu here, but it's handled externally right now
		}
		if (new_index !== -1) {
			top_level_menus[new_index].menu_button_el.classList.add("highlight");
		}
		top_level_menu_index = new_index;
	};
	menus_el.addEventListener("pointerleave", () => {
		// unhighlight unless a menu is open
		if (
			top_level_menu_index !== -1 &&
			top_level_menus[top_level_menu_index].menu_popup_el.style.display === "none"
		) {
			top_level_highlight(-1);
		}
	});

	const is_disabled = item => {
		if (typeof item.enabled === "function") {
			return !item.enabled();
		} else if (typeof item.enabled === "boolean") {
			return !item.enabled;
		} else {
			return false;
		}
	};

	function send_info_event(item) {
		// @TODO: in a future version, give the whole menu item definition (or null)
		const description = item?.description || "";
		if (window.jQuery) {
			// old API (using jQuery's "extraParameters"), made forwards compatible with new API (event.detail)
			const event = new window.jQuery.Event("info", { detail: { description } });
			const extraParam = {
				toString() {
					console.warn("jQuery extra parameter for info event is deprecated, use event.detail instead");
					return description;
				},
			};
			window.jQuery(menus_el).trigger(event, extraParam);
		} else {
			menus_el.dispatchEvent(new CustomEvent("info", { detail: { description } }));
		}
	}


	// attached to menu bar and floating popups (which are not descendants of the menu bar)
	function handleKeyDown(e) {
		if (e.defaultPrevented) {
			return;
		}
		const active_menu_popup_el = active_menu_popup?.element;
		const top_level_menu = top_level_menus[top_level_menu_index];
		const { menu_button_el, open_top_level_menu } = top_level_menu || {};
		const menu_popup_el = active_menu_popup_el || top_level_menu?.menu_popup_el;
		const parent_item_el = parent_item_el_by_popup_el.get(active_menu_popup_el);
		const highlighted_item_el = menu_popup_el?.querySelector(".menu-item.highlight");

		// console.log("keydown", e.key, { target: e.target, active_menu_popup_el, top_level_menu, menu_popup_el, parent_item_el, highlighted_item_el });

		switch (e.key) {
			case "ArrowLeft":
			case "ArrowRight":
				const right = e.key === "ArrowRight";
				if (
					highlighted_item_el?.matches(".has-submenu:not([aria-disabled='true'])") &&
					(get_direction() === "ltr") === right
				) {
					// enter submenu
					highlighted_item_el.click();
					e.preventDefault();
				} else if (
					active_menu_popup &&
					active_menu_popup.parentMenuPopup && // left/right doesn't make sense to close the top level menu
					(get_direction() === "ltr") !== right
				) {
					// exit submenu
					active_menu_popup.close(true); // This changes the active_menu_popup_el to the parent menu!
					parent_item_el.setAttribute("aria-expanded", "false");
					send_info_event(active_menu_popup.menuItems[active_menu_popup.itemElements.indexOf(parent_item_el)]);
					e.preventDefault();
				} else if (
					// basically any case except if you hover to open a submenu and then press right/left
					// in which case the menu is already open/focused
					// This is mimicking the behavior of Explorer's menus; most Windows 98 apps work differently; @TODO: make this configurable
					highlighted_item_el ||
					!active_menu_popup ||
					!active_menu_popup.parentMenuPopup
				) {
					// go to next/previous top level menu, wrapping around
					// and open a new menu only if a menu was already open
					const menu_was_open = menu_popup_el && menu_popup_el.style.display !== "none";
					const cycle_dir = ((get_direction() === "ltr") === right) ? 1 : -1;
					let new_index;
					if (top_level_menu_index === -1) {
						new_index = cycle_dir === 1 ? 0 : top_level_menus.length - 1;
					} else {
						new_index = (top_level_menu_index + cycle_dir + top_level_menus.length) % top_level_menus.length;
					}
					const new_top_level_menu = top_level_menus[new_index];
					const target_button_el = new_top_level_menu.menu_button_el;
					if (menu_was_open) {
						new_top_level_menu.open_top_level_menu("keydown");
					} else {
						menu_button_el?.dispatchEvent(new CustomEvent("release"), {});
						target_button_el.focus({ preventScroll: true });
						// Note case where menu is closed, menu button is hovered, then menu bar is unhovered,
						// rehovered (outside any buttons), and unhovered, and THEN you try to go to the next menu.
						top_level_highlight(new_index);
					}
					e.preventDefault();
				} // else:
				// if there's no highlighted item, the user may be expecting to enter the menu even though it's already open,
				// so it makes sense to do nothing (as Windows 98 does) and not go to the next/previous menu
				// (although highlighting the first item might be nicer...)
				break;
			case "ArrowUp":
			case "ArrowDown":
				const down = e.key === "ArrowDown";
				// if (menu_popup_el && menu_popup_el.style.display !== "none") && highlighted_item_el) {
				if (active_menu_popup) {
					const cycle_dir = down ? 1 : -1;
					const item_els = [...menu_popup_el.querySelectorAll(".menu-item")];
					const from_index = item_els.indexOf(highlighted_item_el);
					let to_index = (from_index + cycle_dir + item_els.length) % item_els.length;
					if (from_index === -1) {
						if (down) {
							to_index = 0;
						} else {
							to_index = item_els.length - 1;
						}
					}
					// more fun way to do it:
					// const to_index = (Math.max(from_index, -down) + cycle_dir + item_els.length) % item_els.length;

					const to_item_el = item_els[to_index];
					// active_menu_popup.highlight(to_index); // wouldn't work because to_index doesn't count separators
					active_menu_popup.highlight(to_item_el);
					send_info_event(active_menu_popup.menuItems[active_menu_popup.itemElements.indexOf(to_item_el)]);
					e.preventDefault();
				} else {
					open_top_level_menu?.("keydown");
				}
				e.preventDefault();
				break;
			case "Escape":
				if (active_menu_popup) {
					// (@TODO: doesn't parent_item_el always exist?)
					if (parent_item_el && parent_item_el !== menu_button_el) {
						// exit submenu (@TODO: DRY further by moving more logic into close()?)
						active_menu_popup.close(true); // This changes the active_menu_popup to the parent menu!
						parent_item_el.setAttribute("aria-expanded", "false");
						send_info_event(active_menu_popup.menuItems[active_menu_popup.itemElements.indexOf(parent_item_el)]);
					} else {
						// close_menus takes care of releasing the pressed state of the button as well
						close_menus();
						menu_button_el.focus({ preventScroll: true });
					}
					e.preventDefault();
				} else {
					const window_el = menus_el.closest(".window");
					if (window_el) {
						// refocus last focused control in window
						// refocus-window should never focus the menu bar
						// it stores the last focused control in the window and specifically not in the menus
						window_el.dispatchEvent(new CustomEvent("refocus-window"));
						e.preventDefault();
					}
				}
				break;
			case "Alt":
				// close all menus and refocus the last focused control in the window
				close_menus();
				refocus_window();
				e.preventDefault();
				break;
			case "Space":
				// opens system menu in Windows 98
				// (at top level)
				break;
			case "Enter":
				if (menu_button_el === document.activeElement) {
					open_top_level_menu("keydown");
					e.preventDefault();
				} else {
					highlighted_item_el?.click();
					e.preventDefault();
				}
				break;
			default:
				if (e.ctrlKey || e.metaKey) {
					break;
				}
				// handle accelerators and first-letter navigation
				const key = e.key.toLowerCase();
				const item_els = active_menu_popup ?
					[...menu_popup_el.querySelectorAll(".menu-item")] :
					top_level_menus.map(top_level_menu => top_level_menu.menu_button_el);
				const item_els_by_accelerator = {};
				for (const item_el of item_els) {
					const accelerator = item_el.querySelector(".menu-hotkey");
					const accelerator_key = (accelerator ?
						accelerator.textContent :
						(item_el.querySelector(".menu-item-label") ?? item_el).textContent[0]
					).toLowerCase();
					item_els_by_accelerator[accelerator_key] = item_els_by_accelerator[accelerator_key] || [];
					item_els_by_accelerator[accelerator_key].push(item_el);
				}
				const matching_item_els = item_els_by_accelerator[key] || [];
				// console.log({ key, item_els, item_els_by_accelerator, matching_item_els });
				if (matching_item_els.length) {
					if (matching_item_els.length === 1) {
						// it's unambiguous, go ahead and activate it
						const menu_item_el = matching_item_els[0];
						// click() doesn't work for menu buttons at the moment,
						// and also we want to highlight the first item in the menu
						// in that case, which doesn't happen with the mouse
						const top_level_menu = top_level_menus.find(top_level_menu => top_level_menu.menu_button_el === menu_item_el);
						if (top_level_menu) {
							top_level_menu.open_top_level_menu("keydown");
						} else {
							menu_item_el.click();
						}
						e.preventDefault();
					} else {
						// cycle the menu items that match the key
						let index = matching_item_els.indexOf(highlighted_item_el);
						if (index === -1) {
							index = 0;
						} else {
							index = (index + 1) % matching_item_els.length;
						}
						const menu_item_el = matching_item_els[index];
						// active_menu_popup.highlight(index); // would very much not work
						active_menu_popup.highlight(menu_item_el);
						e.preventDefault();
					}
				}
				break;
		}
	}

	menus_el.addEventListener("keydown", handleKeyDown);

	// TODO: API for context menus (i.e. floating menu popups)
	function MenuPopup(menu_items, { parentMenuPopup } = {}) {
		this.parentMenuPopup = parentMenuPopup;
		this.menuItems = menu_items;
		this.itemElements = []; // one-to-one with menuItems (note: not all itemElements have class .menu-item) (@TODO: unify terminology)

		const menu_popup_el = E("div", {
			class: "menu-popup",
			id: `menu-popup-${uid()}`,
			tabIndex: "-1",
			role: "menu",
		});
		menu_popup_el.style.touchAction = "pan-y"; // will allow for scrolling overflowing menus in the future, but prevent event delay and double tap to zoom
		menu_popup_el.style.outline = "none";
		const menu_popup_table_el = E("table", { class: "menu-popup-table", role: "presentation" });
		menu_popup_el.appendChild(menu_popup_table_el);

		this.element = menu_popup_el;
		menu_popup_by_el.set(menu_popup_el, this);

		let submenus = [];

		menu_popup_el.addEventListener("keydown", handleKeyDown);

		menu_popup_el.addEventListener("pointerleave", () => {
			// if there's a submenu popup, highlight the item for that, otherwise nothing

			// could use aria-expanded for selecting this, alternatively
			for (const submenu of submenus) {
				if (submenu.submenu_popup_el.style.display !== "none") {
					this.highlight(submenu.item_el);
					return;
				}
			}
			this.highlight(-1);
		});

		menu_popup_el.addEventListener("focusin", (e) => {
			// prevent focus going to menu items; as designed, it works with aria-activedescendant and focus on the menu popup itself
			// (on desktop when clicking (and dragging out) then pressing a key, or on mobile when tapping, a focus ring was visible, and it wouldn't go away with keyboard navigation either)
			menu_popup_el.focus({ preventScroll: true });
		});

		let last_item_el;
		this.highlight = (index_or_element) => { // index includes separators
			let item_el = index_or_element;
			if (typeof index_or_element === "number") {
				item_el = this.itemElements[index_or_element];
			}
			if (last_item_el && last_item_el !== item_el) {
				last_item_el.classList.remove("highlight");
			}
			if (item_el) {
				item_el.classList.add("highlight");
				menu_popup_el.setAttribute("aria-activedescendant", item_el.id);
				last_item_el = item_el;
			} else {
				menu_popup_el.removeAttribute("aria-activedescendant");
				last_item_el = null;
			}
		};

		this.close = (focus_parent_menu_popup = true) => { // Note: won't focus menu bar buttons.
			// idempotent
			for (const submenu of submenus) {
				submenu.submenu_popup.close(false);
			}
			if (focus_parent_menu_popup) {
				this.parentMenuPopup?.element.focus({ preventScroll: true });
			}
			menu_popup_el.style.display = "none";
			this.highlight(-1);
			// after closing submenus, which should move the active_menu_popup to this level, move it up to the parent level
			if (active_menu_popup === this) {
				active_menu_popup = this.parentMenuPopup;
			}
		};

		const add_menu_item = (parent_element, item, item_index) => {
			const row_el = E("tr", { class: "menu-row" });
			this.itemElements.push(row_el);
			parent_element.appendChild(row_el);
			if (item === MENU_DIVIDER) {
				const td_el = E("td", { colspan: 4 });
				const hr_el = E("hr", { class: "menu-hr" });
				// hr_el.setAttribute("role", "separator"); // this is the implicit ARIA role for <hr>
				// and setting it on the <tr> might cause problems due to multiple elements with the role
				// hopefully it's fine that the semantic <hr> is nested?
				td_el.appendChild(hr_el);
				row_el.appendChild(td_el);
				// Favorites menu behavior:
				// hr_el.addEventListener("click", () => {
				// 	this.highlight(-1);
				// });
				// Normal menu behavior:
				hr_el.addEventListener("pointerenter", () => {
					this.highlight(-1);
				});
			} else {
				const item_el = row_el;
				item_el.classList.add("menu-item");
				item_el.id = `menu-item-${uid()}`;
				item_el.tabIndex = -1; // may be needed for aria-activedescendant in some browsers?
				item_el.setAttribute("role", item.checkbox ? item.checkbox.type === "radio" ? "menuitemradio" : "menuitemcheckbox" : "menuitem");
				// prevent announcing the SHORTCUT (distinct from the hotkey, which would already not be announced unless it's e.g. a translated string like "새로 만들기 (&N)")
				// remove_hotkey so it doesn't announce an ampersand
				item_el.setAttribute("aria-label", remove_hotkey(item.label || item.item));
				// include the shortcut semantically; if you want to display the shortcut differently than aria-keyshortcuts syntax,
				// provide both ariaKeyShortcuts and shortcutLabel (old API: shortcut)
				item_el.setAttribute("aria-keyshortcuts", item.ariaKeyShortcuts || item.shortcut || item.shortcutLabel);

				if (item.description) {
					item_el.setAttribute("aria-description", item.description);
				}
				const checkbox_area_el = E("td", { class: "menu-item-checkbox-area" });
				const label_el = E("td", { class: "menu-item-label" });
				const shortcut_el = E("td", { class: "menu-item-shortcut" });
				const submenu_area_el = E("td", { class: "menu-item-submenu-area" });

				item_el.appendChild(checkbox_area_el);
				item_el.appendChild(label_el);
				item_el.appendChild(shortcut_el);
				item_el.appendChild(submenu_area_el);

				label_el.innerHTML = display_hotkey(item.label || item.item);
				shortcut_el.textContent = item.shortcut;

				menu_popup_el.addEventListener("update", () => {
					// item_el.disabled = is_disabled(item); // doesn't work, probably because it's a <tr>
					if (is_disabled(item)) {
						item_el.setAttribute("disabled", "");
						item_el.setAttribute("aria-disabled", "true");
					} else {
						item_el.removeAttribute("disabled");
						item_el.removeAttribute("aria-disabled");
					}
					if (item.checkbox && item.checkbox.check) {
						const checked = item.checkbox.check();
						item_el.setAttribute("aria-checked", checked ? "true" : "false");
					}
				});
				// You may ask, why not call `send_info_event` in `highlight`?
				// Consider the case where you hover to open a menu, and it sets highlight to none,
				// it shouldn't reset the status bar. It needs to be more based on the pointer and keyboard interactions directly.
				// *Maybe* it could be a parameter (to `highlight`) if that's really helpful, but it's probably not.
				// *Maybe* it could look at more of the overall state within `highlight`,
				// but could it distinguish hovering an outer vs an inner item if two are highlighted?
				item_el.addEventListener("pointerenter", () => {
					this.highlight(item_index);
					send_info_event(item);
				});
				item_el.addEventListener("pointerleave", (event) => {
					if (
						menu_popup_el.style.display !== "none" && // not "left" due to closing
						event.pointerType !== "touch" // not "left" as in finger lifting off
					) {
						send_info_event();
					}
				});
				
				if (item.checkbox?.type === "radio") {
					checkbox_area_el.classList.add("radio");
				} else if (item.checkbox) {
					checkbox_area_el.classList.add("checkbox");
				}

				let open_submenu, submenu_popup_el;
				if (item.submenu) {
					item_el.classList.add("has-submenu"); // @TODO: remove this, and use [aria-haspopup] instead (note true = menu)
					submenu_area_el.classList.toggle("point-right", get_direction() === "rtl");

					const submenu_popup = new MenuPopup(item.submenu, { parentMenuPopup: this });
					submenu_popup_el = submenu_popup.element;
					document.body?.appendChild(submenu_popup_el);
					submenu_popup_el.style.display = "none";

					item_el.setAttribute("aria-haspopup", "true");
					item_el.setAttribute("aria-expanded", "false");
					item_el.setAttribute("aria-controls", submenu_popup_el.id);

					submenu_popup_by_menu_item_el.set(item_el, submenu_popup);
					parent_item_el_by_popup_el.set(submenu_popup_el, item_el);
					submenu_popup_el.dataset.semanticParent = menu_popup_el.id; // for $Window to understand the popup belongs to its window
					menu_popup_el.setAttribute("aria-owns", `${menu_popup_el.getAttribute("aria-owns") || ""} ${submenu_popup_el.id}`);
					submenu_popup_el.setAttribute("aria-labelledby", item_el.id);


					open_submenu = (highlight_first = true) => {
						if (submenu_popup_el.style.display !== "none") {
							return;
						}
						if (item_el.getAttribute("aria-disabled") === "true") {
							return;
						}
						close_submenus_at_this_level();

						item_el.setAttribute("aria-expanded", "true");

						submenu_popup_el.style.display = "";
						submenu_popup_el.style.zIndex = get_new_menu_z_index();
						submenu_popup_el.setAttribute("dir", get_direction());
						if (window.inheritTheme) {
							window.inheritTheme(submenu_popup_el, menu_popup_el);
						}
						if (!submenu_popup_el.parentElement) {
							document.body.appendChild(submenu_popup_el);
						}

						// console.log("open_submenu — submenu_popup_el.style.zIndex", submenu_popup_el.style.zIndex, "$Window.Z_INDEX", $Window.Z_INDEX, "menus_el.closest('.window').style.zIndex", menus_el.closest(".window").style.zIndex);
						// setTimeout(() => { console.log("after timeout, menus_el.closest('.window').style.zIndex", menus_el.closest(".window").style.zIndex); }, 0);
						submenu_popup_el.dispatchEvent(new CustomEvent("update"), {});
						if (highlight_first) {
							submenu_popup.highlight(0);
							send_info_event(submenu_popup.menuItems[0]);
						} else {
							submenu_popup.highlight(-1);
							// send_info_event(); // no, keep the status bar text!
						}

						const rect = item_el.getBoundingClientRect();
						let submenu_popup_rect = submenu_popup_el.getBoundingClientRect();
						submenu_popup_el.style.position = "absolute";
						submenu_popup_el.style.left = `${(get_direction() === "rtl" ? rect.left - submenu_popup_rect.width : rect.right) + window.scrollX}px`;
						submenu_popup_el.style.top = `${rect.top + window.scrollY}px`;

						submenu_popup_rect = submenu_popup_el.getBoundingClientRect();
						// This is surely not the cleanest way of doing this,
						// and the logic is not very robust in the first place,
						// but I want to get RTL support done and so I'm mirroring this in the simplest way possible.
						if (get_direction() === "rtl") {
							if (submenu_popup_rect.left < 0) {
								submenu_popup_el.style.left = `${rect.right}px`;
								submenu_popup_rect = submenu_popup_el.getBoundingClientRect();
								if (submenu_popup_rect.right > innerWidth) {
									submenu_popup_el.style.left = `${innerWidth - submenu_popup_rect.width}px`;
								}
							}
						} else {
							if (submenu_popup_rect.right > innerWidth) {
								submenu_popup_el.style.left = `${rect.left - submenu_popup_rect.width}px`;
								submenu_popup_rect = submenu_popup_el.getBoundingClientRect();
								if (submenu_popup_rect.left < 0) {
									submenu_popup_el.style.left = "0";
								}
							}
						}

						submenu_popup_el.focus({ preventScroll: true });
						active_menu_popup = submenu_popup;
					};

					submenus.push({
						item_el,
						submenu_popup_el,
						submenu_popup,
					});

					function close_submenus_at_this_level() {
						for (const { submenu_popup, item_el } of submenus) {
							submenu_popup.close(false);
							item_el.setAttribute("aria-expanded", "false");
						}
						menu_popup_el.focus({ preventScroll: true });
					}

					// It should close when hovering a different higher level menu
					// after a delay, unless the mouse returns to the submenu.
					// If you return the mouse from a submenu into its parent
					// *directly onto the parent menu item*, it stays open, but if you cross other menu items
					// in the parent menu, (@TODO:) it'll close after the delay even if you land on the parent menu item.
					// Once a submenu opens (completing its animation if it has one),
					// - up/down should navigate the submenu (although it should not show as focused right away)
					//   (i.e. up/down always navigate the most-nested open submenu, as long as it's not animating, in which case nothing happens)
					// - @TODO: the submenu cancels its closing timeout (if you've moved outside all menus, say)
					//   (but if you move outside menus AFTER the submenu has opened, it should start the closing timeout)
					// @TODO: make this more robust in general! Make some automated tests.

					let open_tid, close_tid;
					submenu_popup_el.addEventListener("pointerenter", () => {
						if (open_tid) { clearTimeout(open_tid); open_tid = null; }
						if (close_tid) { clearTimeout(close_tid); close_tid = null; }
					});
					item_el.addEventListener("pointerenter", () => {
						// @TODO: don't cancel close timer? in Windows 98 it'll still close after a delay if you hover the submenu's parent item
						if (open_tid) { clearTimeout(open_tid); open_tid = null; }
						if (close_tid) { clearTimeout(close_tid); close_tid = null; }
						open_tid = setTimeout(() => {
							open_submenu(false);
						}, 501); // @HACK: slightly longer than close timer so it doesn't close immediately
					});
					item_el.addEventListener("pointerleave", () => {
						if (open_tid) { clearTimeout(open_tid); open_tid = null; }
					});
					menu_popup_el.addEventListener("pointerenter", (event) => {
						// console.log(event.target.closest(".menu-item"));
						if (event.target.closest(".menu-item") === item_el) {
							return;
						}
						if (!close_tid) {
							// This is a little confusing, with timers per-item...
							// @TODO: try doing this with just one or two timers.
							// if (submenus.some(submenu => submenu.submenu_popup_el.style.display !== "none")) {
							if (submenu_popup_el.style.display !== "none") {
								close_tid = setTimeout(() => {
									if (!window.debugKeepMenusOpen) {
										// close_submenu();
										close_submenus_at_this_level();
									}
								}, 500);
							}
						}
					});
					// keep submenu open while mouse is outside any parent menus
					// (@TODO: what if it goes to another parent menu though?)
					menu_popup_el.addEventListener("pointerleave", () => {
						if (close_tid) { clearTimeout(close_tid); close_tid = null; }
					});

					item_el.addEventListener("pointerdown", () => { open_submenu(false); });
				}

				let just_activated = false; // to prevent double-activation from pointerup + click
				const item_action = () => {
					if (just_activated) {
						return;
					}
					just_activated = true;
					setTimeout(() => { just_activated = false; }, 10);

					if (item.checkbox) {
						if (item.checkbox.toggle) {
							item.checkbox.toggle();
						}
						menu_popup_el.dispatchEvent(new CustomEvent("update"), {});
					} else if (item.action) {
						close_menus();
						refocus_window(); // before action, so things like copy/paste have a better chance of working
						item.action();
					}
				};
				// pointerup is for gliding to menu items to activate
				item_el.addEventListener("pointerup", e => {
					if (e.pointerType === "mouse" && e.button !== 0) {
						return;
					}
					if (e.pointerType === "touch") {
						// Will use click instead; otherwise focus is lost on a delay: if it opens a dialog for example,
						// you have to hold down on the menu item for a bit otherwise it'll blur the dialog after opening.
						// I think this is caused by the pointer falling through to elements without touch-action defined.
						// RIGHT NOW, gliding to menu items isn't supported for touch anyways,
						// although I'd like to support it in the future.
						// Well, it might have accessibility problems, so maybe not. I think this is fine.
						return;
					}
					item_el.click();
				});
				item_el.addEventListener("click", e => {
					if (item.submenu) {
						open_submenu(true);
					} else {
						item_action();
					}
				});
			}
		};

		if (menu_items.length === 0) {
			menu_items = [{
				label: "(Empty)",
				enabled: false,
			}];
		}
		let init_index = 0;
		for (const item of menu_items) {
			if (item.radioItems) {
				const tbody = E("tbody", { role: "group" }); // multiple tbody elements are allowed, can be used for grouping rows,
				// and in this case providing an ARIA role for the radio group.
				if (item.ariaLabel) {
					tbody.setAttribute("aria-label", item.ariaLabel);
				}

				for (const radio_item of item.radioItems) {
					radio_item.checkbox = {
						type: "radio",
						check: () => radio_item.value === item.getValue(),
						toggle: () => {
							item.setValue(radio_item.value);
						},
					};
					add_menu_item(tbody, radio_item, init_index++);
				}
				menu_popup_table_el.appendChild(tbody);
			} else {
				add_menu_item(menu_popup_table_el, item, init_index++);
			}
		}
	}

	// let this_click_opened_the_menu = false;
	const make_menu_button = (menus_key, menu_items) => {
		const menu_button_el = E("div", {
			class: "menu-button",
			"aria-expanded": "false",
			"aria-haspopup": "true",
			role: "menuitem",
		});

		menus_el.appendChild(menu_button_el);

		const menu_popup = new MenuPopup(menu_items);
		const menu_popup_el = menu_popup.element;
		document.body?.appendChild(menu_popup_el);
		submenu_popup_by_menu_item_el.set(menu_button_el, menu_popup);
		parent_item_el_by_popup_el.set(menu_popup_el, menu_button_el);
		menu_button_el.id = `menu-button-${menus_key}-${uid()}`;
		menu_popup_el.dataset.semanticParent = menu_button_el.id; // for $Window to understand the popup belongs to its window
		menu_button_el.setAttribute("aria-controls", menu_popup_el.id);
		menu_popup_el.setAttribute("aria-labelledby", menu_button_el.id);
		menus_el.setAttribute("aria-owns", `${menus_el.getAttribute("aria-owns") || ""} ${menu_popup_el.id}`);

		const update_position_from_containing_bounds = () => {
			const rect = menu_button_el.getBoundingClientRect();
			let popup_rect = menu_popup_el.getBoundingClientRect();
			menu_popup_el.style.position = "absolute";
			menu_popup_el.style.left = `${(get_direction() === "rtl" ? rect.right - popup_rect.width : rect.left) + window.scrollX}px`;
			menu_popup_el.style.top = `${rect.bottom + window.scrollY}px`;

			const uncorrected_rect = menu_popup_el.getBoundingClientRect();
			// rounding down is needed for RTL layout for the rightmost menu, to prevent a scrollbar
			if (Math.floor(uncorrected_rect.right) > innerWidth) {
				menu_popup_el.style.left = `${innerWidth - uncorrected_rect.width}px`;
			}
			if (Math.ceil(uncorrected_rect.left) < 0) {
				menu_popup_el.style.left = "0px";
			}
		};
		window.addEventListener("resize", update_position_from_containing_bounds);
		menu_popup_el.addEventListener("update", update_position_from_containing_bounds);
		// update_position_from_containing_bounds(); // will be called when the menu is opened

		const menu_id = menus_key.replace("&", "").replace(/ /g, "-").toLowerCase();
		menu_button_el.classList.add(`${menu_id}-menu-button`);
		// menu_popup_el.id = `${menu_id}-menu-popup-${uid()}`; // id is created by MenuPopup and changing it breaks the data-semantic-parent relationship
		menu_popup_el.style.display = "none";
		menu_button_el.innerHTML = display_hotkey(menus_key);
		menu_button_el.tabIndex = -1;

		menu_button_el.setAttribute("aria-haspopup", "true");
		menu_button_el.setAttribute("aria-controls", menu_popup_el.id);

		menu_button_el.addEventListener("focus", () => {
			top_level_highlight(menus_key);
		});
		menu_button_el.addEventListener("pointerdown", e => {
			if (menu_button_el.classList.contains("active")) {
				menu_button_el.dispatchEvent(new CustomEvent("release", {}));
				refocus_window();
				e.preventDefault(); // needed for refocus_window() to work
			} else {
				open_top_level_menu(e.type);
			}
		});
		menu_button_el.addEventListener("pointermove", e => {
			top_level_highlight(menus_key);
			if (e.pointerType === "touch") {
				return;
			}
			if (selecting_menus) {
				open_top_level_menu(e.type);
			}
		});
		function open_top_level_menu(type = "other") {

			const new_index = Object.keys(menus).indexOf(menus_key);
			if (new_index === top_level_menu_index && menu_button_el.getAttribute("aria-expanded") === "true") {
				return; // already open
			}

			close_menus();

			menu_button_el.classList.add("active");
			menu_button_el.setAttribute("aria-expanded", "true");
			menu_popup_el.style.display = "";
			menu_popup_el.style.zIndex = get_new_menu_z_index();
			menu_popup_el.setAttribute("dir", get_direction());
			if (window.inheritTheme) {
				window.inheritTheme(menu_popup_el, menus_el);
			}
			if (!menu_popup_el.parentElement) {
				document.body.appendChild(menu_popup_el);
			}
			// console.log("pointerdown (possibly simulated) — menu_popup_el.style.zIndex", menu_popup_el.style.zIndex, "$Window.Z_INDEX", $Window.Z_INDEX, "menus_el.closest('.window').style.zIndex", menus_el.closest(".window").style.zIndex);
			// setTimeout(() => { console.log("after timeout, menus_el.closest('.window').style.zIndex", menus_el.closest(".window").style.zIndex); }, 0);
			top_level_highlight(menus_key);

			menu_popup_el.dispatchEvent(new CustomEvent("update"), {});

			selecting_menus = true;

			menu_popup_el.focus({ preventScroll: true });
			active_menu_popup = menu_popup;

			if (type === "keydown") {
				menu_popup.highlight(0);
				send_info_event(menu_popup.menuItems[0]);
			} else {
				send_info_event(); // @TODO: allow descriptions on top level menus
			}
		};
		menu_button_el.addEventListener("release", () => {
			selecting_menus = false;

			menu_button_el.classList.remove("active");
			if (!window.debugKeepMenusOpen) {
				menu_popup.close(true);
				menu_button_el.setAttribute("aria-expanded", "false");
			}

			menus_el.dispatchEvent(new CustomEvent("default-info", {}));
		});
		top_level_menus.push({
			menu_button_el,
			menu_popup_el,
			menus_key,
			hotkey: get_hotkey(menus_key),
			open_top_level_menu,
		});
	};
	for (const menu_key in menus) {
		make_menu_button(menu_key, menus[menu_key]);
	}

	window.addEventListener("keydown", e => {
		// close any errant menus
		// taking care not to interfere with regular Escape key behavior
		// @TODO: listen for menus_el removed from DOM, and close menus there
		if (
			!document.activeElement ||
			!document.activeElement.closest || // window or document
			!document.activeElement.closest(".menus, .menu-popup")
		) {
			if (e.key === "Escape") {
				if (active_menu_popup) {
					close_menus();
					e.preventDefault();
				}
			}
		}
	});
	// window.addEventListener("blur", close_menus);
	window.addEventListener("blur", (event) => {
		// hack for Pinball (in 98.js.org) where it triggers fake blur events
		// in order to pause the game
		if (!event.isTrusted) {
			return;
		}
		close_menus();
	});
	function close_menus_on_click_outside(event) {
		if (event.target?.closest?.(".menus") === menus_el || event.target?.closest?.(".menu-popup")) {
			return;
		}
		// window.console && console.log(event.type, "occurred outside of menus (on ", event.target, ") so...");
		close_menus();
		top_level_highlight(-1);
	}
	window.addEventListener("pointerdown", close_menus_on_click_outside);
	window.addEventListener("pointerup", close_menus_on_click_outside);

	window.addEventListener("focusout", (event) => {
		// if not still in menus, unhighlight (e.g. if you hit Escape to unfocus the menus)
		if (event.relatedTarget?.closest?.(".menus") === menus_el || event.relatedTarget?.closest?.(".menu-popup")) {
			return;
		}
		close_menus();
		// Top level buttons should no longer be highlighted due to focus, but still may be highlighted due to hover.
		top_level_highlight(top_level_menus.findIndex(({ menu_button_el }) => menu_button_el.matches(":hover")));
	});

	let keyboard_scope_elements = [];
	function set_keyboard_scope(...elements) {
		for (const el of keyboard_scope_elements) {
			el.removeEventListener("keydown", keyboard_scope_keydown);
		}
		keyboard_scope_elements = elements;
		for (const el of keyboard_scope_elements) {
			el.addEventListener("keydown", keyboard_scope_keydown);
		}
	}
	function keyboard_scope_keydown(e) {
		// Close menus if the user presses almost any key combination
		// e.g. if you look in the menu to remember a shortcut,
		// and then use the shortcut.
		if (
			(e.ctrlKey || e.metaKey) && // Ctrl or Command held down
			// and anything then pressed other than Ctrl or Command
			e.key !== "Control" &&
			e.key !== "Meta"
		) {
			close_menus();
			return;
		}
		if (e.defaultPrevented) {
			return; // closing menus above is meant to be done when activating unrelated shortcuts
			// but stuff after this is should not be handled at the same time as something else
		}
		if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) { // Alt held
			const menu = top_level_menus.find((menu) =>
				menu.hotkey.toLowerCase() === e.key.toLowerCase()
			);
			if (menu) {
				e.preventDefault();
				menu.open_top_level_menu("keydown");
			}
		}
	}

	set_keyboard_scope(window);

	this.element = menus_el;
	this.closeMenus = close_menus;
	this.setKeyboardScope = set_keyboard_scope;
}

exports.MenuBar = MenuBar;
exports.MENU_DIVIDER = MENU_DIVIDER;

})(window);
