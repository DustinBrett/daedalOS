((exports) => {
	// Segments here represent UI components as far as a layout algorithm is concerned,
	// line segments in one dimension (regardless of whether that dimension is vertical or horizontal),
	// with a reference to the UI component DOM element so it can be updated.

	function get_segments(component_area_el, pos_axis, exclude_component_el) {
		const $other_components = $(component_area_el).find(".component").not(exclude_component_el);
		return $other_components.toArray().map((component_el) => {
			const segment = { element: component_el };
			if (pos_axis === "top") {
				segment.pos = component_el.offsetTop;
				segment.length = component_el.clientHeight;
			} else if (pos_axis === "left") {
				segment.pos = component_el.offsetLeft;
				segment.length = component_el.clientWidth;
			} else if (pos_axis === "right") {
				segment.pos = component_area_el.scrollWidth - component_el.offsetLeft;
				segment.length = component_el.clientWidth;
			}
			return segment;
		});
	}

	function adjust_segments(segments, total_available_length) {
		segments.sort((a, b) => a.pos - b.pos);

		// Clamp
		for (const segment of segments) {
			segment.pos = Math.max(segment.pos, 0);
			segment.pos = Math.min(segment.pos, total_available_length - segment.length);
		}

		// Shove things downwards to prevent overlap
		for (let i = 1; i < segments.length; i++) {
			const segment = segments[i];
			const prev_segment = segments[i - 1];
			const overlap = prev_segment.pos + prev_segment.length - segment.pos;
			if (overlap > 0) {
				segment.pos += overlap;
			}
		}

		// Clamp
		for (const segment of segments) {
			segment.pos = Math.max(segment.pos, 0);
			segment.pos = Math.min(segment.pos, total_available_length - segment.length);
		}

		// Shove things upwards to get things back on screen
		for (let i = segments.length - 2; i >= 0; i--) {
			const segment = segments[i];
			const prev_segment = segments[i + 1];
			const overlap = segment.pos + segment.length - prev_segment.pos;
			if (overlap > 0) {
				segment.pos -= overlap;
			}
		}
	}

	function apply_segments(component_area_el, pos_axis, segments) {
		// Since things aren't positioned absolutely, calculate space between
		let length_before = 0;
		for (const segment of segments) {
			segment.margin_before = segment.pos - length_before;
			length_before = segment.length + segment.pos;
		}

		// Apply to the DOM
		for (const segment of segments) {
			component_area_el.appendChild(segment.element);
			$(segment.element).css(`margin-${pos_axis}`, segment.margin_before);
		}
	}

	function $Component(title, className, orientation, $el) {
		// A draggable widget that can be undocked into a window
		const $c = $(E("div")).addClass("component");
		$c.addClass(className);
		$c.addClass(orientation);
		$c.append($el);
		$c.css("touch-action", "none");

		const $w = new $ToolWindow($c);
		$w.title(title);
		$w.hide();
		$w.$content.addClass({
			tall: "vertical",
			wide: "horizontal",
		}[orientation]);

		// Nudge the Colors component over a tiny bit
		if (className === "colors-component" && orientation === "wide") {
			$c.css("position", "relative");
			$c.css(`margin-${get_direction() === "rtl" ? "right" : "left"}`, "3px");
		}

		let iid;
		if ($("body").hasClass("eye-gaze-mode")) {
			// @TODO: don't use an interval for this!
			iid = setInterval(() => {
				const scale = 3;
				$c.css({
					transform: `scale(${scale})`,
					transformOrigin: "0 0",
					marginRight: $c[0].scrollWidth * (scale - 1),
					marginBottom: $c[0].scrollHeight * (scale - 1),
				});
			}, 200);
		}

		let ox, oy;
		let ox2, oy2;
		let w, h;
		let pos = 0;
		let pos_axis;
		let last_docked_to_pos;
		let $last_docked_to;
		let $dock_to;
		let $ghost;

		if (orientation === "tall") {
			pos_axis = "top";
		} else if (get_direction() === "rtl") {
			pos_axis = "right";
		} else {
			pos_axis = "left";
		}

		const dock_to = $dock_to => {
			$w.hide();

			// must get layout state *before* changing it
			const segments = get_segments($dock_to[0], pos_axis, $c[0]);

			// so we can measure clientWidth/clientHeight
			$dock_to.append($c);

			segments.push({
				element: $c[0],
				pos: pos,
				length: $c[0][pos_axis === "top" ? "clientHeight" : "clientWidth"],
			});

			const total_available_length = pos_axis === "top" ? $dock_to.height() : $dock_to.width();
			// console.log("before adjustment", JSON.stringify(segments, (_key,val)=> (val instanceof Element) ? val.className : val));
			adjust_segments(segments, total_available_length);
			// console.log("after adjustment", JSON.stringify(segments, (_key,val)=> (val instanceof Element) ? val.className : val));

			apply_segments($dock_to[0], pos_axis, segments);

			// Save where it's now docked to
			$last_docked_to = $dock_to;
			last_docked_to_pos = pos;
		};
		const undock_to = (x, y) => {
			const component_area_el = $c.closest(".component-area")[0];
			// must get layout state *before* changing it
			const segments = get_segments(component_area_el, pos_axis, $c[0]);

			$c.css("position", "relative");
			$c.css(`margin-${pos_axis}`, "");

			// Put the component in the window
			$w.$content.append($c);
			// Show and position the window
			$w.show();
			$w.css({
				left: x,
				top: y,
			});

			const total_available_length = pos_axis === "top" ? $(component_area_el).height() : $(component_area_el).width();
			// console.log("before adjustment", JSON.stringify(segments, (_key,val)=> (val instanceof Element) ? val.className : val));
			adjust_segments(segments, total_available_length);
			// console.log("after adjustment", JSON.stringify(segments, (_key,val)=> (val instanceof Element) ? val.className : val));
			apply_segments(component_area_el, pos_axis, segments);
		};

		$w.on("window-drag-start", (e) => {
			e.preventDefault();
		});
		const imagine_window_dimensions = () => {
			const prev_window_shown = $w.is(":visible");
			$w.show();
			let $spacer;
			let { offsetLeft, offsetTop } = $c[0];
			if ($c.closest(".tool-window").length == 0) {
				const styles = getComputedStyle($c[0]);
				$spacer = $(E("div")).addClass("component").css({
					width: styles.width,
					height: styles.height,
					// don't copy margin, margin is actually used for positioning the components in the docking areas
					// don't copy padding, padding changes based on whether the component is in a window in modern theme
					// let padding be influenced by CSS
				});
				$w.append($spacer);
				({ offsetLeft, offsetTop } = $spacer[0]);
			}
			const rect = $w[0].getBoundingClientRect();
			if ($spacer) {
				$spacer.remove();
			}
			if (!prev_window_shown) {
				$w.hide();
			}
			const w_styles = getComputedStyle($w[0]);
			offsetLeft += parseFloat(w_styles.borderLeftWidth);
			offsetTop += parseFloat(w_styles.borderTopWidth);
			return { rect, offsetLeft, offsetTop };
		};
		const imagine_docked_dimensions = ($dock_to = (pos_axis === "top" ? $left : $bottom)) => {
			if ($c.closest(".tool-window").length == 0) {
				return { rect: $c[0].getBoundingClientRect() };
			}
			const styles = getComputedStyle($c[0]);
			const $spacer = $(E("div")).addClass("component").css({
				width: styles.width,
				height: styles.height,
				flex: "0 0 auto",
			});
			$dock_to.prepend($spacer);
			const rect = $spacer[0].getBoundingClientRect();
			if ($spacer) {
				$spacer.remove();
			}
			return { rect };
		};
		const render_ghost = (e) => {

			const { rect } = $dock_to ? imagine_docked_dimensions($dock_to) : imagine_window_dimensions()

			// Make sure these dimensions are odd numbers
			// so the alternating pattern of the border is unbroken
			w = (~~(rect.width / 2)) * 2 + 1;
			h = (~~(rect.height / 2)) * 2 + 1;

			if (!$ghost) {
				$ghost = $(E("div")).addClass("component-ghost dock");
				$ghost.appendTo("body");
			}
			const inset = $dock_to ? 0 : 3;
			$ghost.css({
				position: "absolute",
				display: "block",
				width: w - inset * 2,
				height: h - inset * 2,
				left: e.clientX + ($dock_to ? ox : ox2) + inset,
				top: e.clientY + ($dock_to ? oy : oy2) + inset,
			});

			if ($dock_to) {
				$ghost.addClass("dock");
			} else {
				$ghost.removeClass("dock");
			}
		};
		$c.add($w.$titlebar).on("pointerdown", e => {
			// Only start a drag via a left click directly on the component element or titlebar
			if (e.button !== 0) { return; }
			const validTarget =
				$c.is(e.target) ||
				(
					$(e.target).closest($w.$titlebar).length > 0 &&
					$(e.target).closest("button").length === 0
				);
			if (!validTarget) { return; }
			// Don't allow dragging in eye gaze mode
			if ($("body").hasClass("eye-gaze-mode")) { return; }

			const docked = imagine_docked_dimensions();
			const rect = $c[0].getBoundingClientRect();
			ox = rect.left - e.clientX;
			oy = rect.top - e.clientY;
			ox = -Math.min(Math.max(-ox, 0), docked.rect.width);
			oy = -Math.min(Math.max(-oy, 0), docked.rect.height);

			const { offsetLeft, offsetTop } = imagine_window_dimensions();
			ox2 = rect.left - offsetLeft - e.clientX;
			oy2 = rect.top - offsetTop - e.clientY;

			$("body").addClass("dragging");
			$("body").css({ cursor: "default" }).addClass("cursor-bully");

			$G.on("pointermove", drag_update_position);
			$G.one("pointerup", e => {
				$G.off("pointermove", drag_update_position);
				drag_onpointerup(e);
				$("body").removeClass("dragging");
				$("body").css({ cursor: "" }).removeClass("cursor-bully");
				$canvas.trigger("pointerleave"); // prevent magnifier preview showing until you move the mouse
			});

			render_ghost(e);
			drag_update_position(e);

			// Prevent text selection anywhere within the component
			e.preventDefault();
		});
		const drag_update_position = e => {

			$ghost.css({
				left: e.clientX + ox,
				top: e.clientY + oy,
			});

			$dock_to = null;

			const { width, height } = imagine_docked_dimensions().rect;
			const dock_ghost_left = e.clientX + ox;
			const dock_ghost_top = e.clientY + oy;
			const dock_ghost_right = dock_ghost_left + width;
			const dock_ghost_bottom = dock_ghost_top + height;
			const q = 5;
			if (orientation === "tall") {
				pos_axis = "top";
				if (dock_ghost_left - q < $left[0].getBoundingClientRect().right) {
					$dock_to = $left;
				}
				if (dock_ghost_right + q > $right[0].getBoundingClientRect().left) {
					$dock_to = $right;
				}
			} else {
				pos_axis = get_direction() === "rtl" ? "right" : "left";
				if (dock_ghost_top - q < $top[0].getBoundingClientRect().bottom) {
					$dock_to = $top;
				}
				if (dock_ghost_bottom + q > $bottom[0].getBoundingClientRect().top) {
					$dock_to = $bottom;
				}
			}

			if ($dock_to) {
				const dock_to_rect = $dock_to[0].getBoundingClientRect();
				pos = (
					pos_axis === "top" ? dock_ghost_top : pos_axis === "right" ? dock_ghost_right : dock_ghost_left
				) - dock_to_rect[pos_axis];
				if (pos_axis === "right") {
					pos *= -1;
				}
			}

			render_ghost(e);

			e.preventDefault();
		};

		const drag_onpointerup = e => {

			$w.hide();

			// If the component is docked to a component area (a side)
			if ($c.parent().is(".component-area")) {
				// Save where it's docked so we can dock back later
				$last_docked_to = $c.parent();
				if ($dock_to) {
					last_docked_to_pos = pos;
				}
			}

			if ($dock_to) {
				// Dock component to $dock_to
				dock_to($dock_to);
			} else {
				undock_to(e.clientX + ox2, e.clientY + oy2);
			}

			$ghost && $ghost.remove();
			$ghost = null;

			$G.trigger("resize");
		};

		$c.dock = ($dock_to) => {
			pos = last_docked_to_pos ?? 0;
			dock_to($dock_to ?? $last_docked_to);
		};
		$c.undock_to = undock_to;

		$c.show = () => {
			$($c[0]).show(); // avoid recursion
			if ($.contains($w[0], $c[0])) {
				$w.show();
			}
			return $c;
		};
		$c.hide = () => {
			$c.add($w).hide();
			return $c;
		};
		$c.toggle = () => {
			if ($c.is(":visible")) {
				$c.hide();
			} else {
				$c.show();
			}
			return $c;
		};
		$c.destroy = () => {
			$w.close();
			$c.remove();
			clearInterval(iid);
		};

		$w.on("close", e => {
			e.preventDefault();
			$w.hide();
		});

		return $c;
	}

	exports.$Component = $Component;

})(window);
