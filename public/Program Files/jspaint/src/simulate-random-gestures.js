((exports) => {

	let seed = 4; // chosen later

	const seededRandom = (max = 1, min = 0) => {
		seed = (seed * 9301 + 49297) % 233280;
		const rnd = seed / 233280;

		return min + rnd * (max - min);
	};

	exports.stopSimulatingGestures && exports.stopSimulatingGestures();
	exports.simulatingGestures = false;

	let gestureTimeoutID;
	let periodicGesturesTimeoutID;

	let choose = (array) => array[~~(seededRandom() * array.length)];
	let isAnyMenuOpen = () => $(".menu-button.active").length > 0;

	let cursor_image = new Image();
	cursor_image.src = "images/cursors/default.png";

	const $cursor = $(cursor_image).addClass("user-cursor");
	$cursor.css({
		position: "absolute",
		left: 0,
		top: 0,
		opacity: 0,
		zIndex: 5, // @#: z-index
		pointerEvents: "none",
		transition: "opacity 0.5s",
	});

	exports.simulateRandomGesture = (callback, { shift, shiftToggleChance = 0.01, secondary, secondaryToggleChance, target = main_canvas }) => {
		let startWithinRect = target.getBoundingClientRect();
		let canvasAreaRect = $canvas_area[0].getBoundingClientRect();

		let startMinX = Math.max(startWithinRect.left, canvasAreaRect.left);
		let startMaxX = Math.min(startWithinRect.right, canvasAreaRect.right);
		let startMinY = Math.max(startWithinRect.top, canvasAreaRect.top);
		let startMaxY = Math.min(startWithinRect.bottom, canvasAreaRect.bottom);
		let startPointX = startMinX + seededRandom() * (startMaxX - startMinX);
		let startPointY = startMinY + seededRandom() * (startMaxY - startMinY);

		$cursor.appendTo($app);
		let triggerMouseEvent = (type, point) => {

			if (isAnyMenuOpen()) {
				return;
			}

			const clientX = point.x;
			const clientY = point.y;
			const el_over = document.elementFromPoint(clientX, clientY);
			const do_nothing = !type.match(/move/) && (!el_over || !el_over.closest(".canvas-area"));
			$cursor.css({
				display: "block",
				position: "absolute",
				left: clientX,
				top: clientY,
				opacity: do_nothing ? 0.5 : 1,
			});
			if (do_nothing) {
				return;
			}

			let event = new $.Event(type, {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX,
				clientY,
				screenX: clientX,
				screenY: clientY,
				offsetX: point.x,
				offsetY: point.y,
				button: secondary ? 2 : 0,
				buttons: secondary ? 2 : 1,
				shiftKey: shift,
			});
			$(target).trigger(event);
		};

		let t = 0;
		let gestureComponents = [];
		let numberOfComponents = 5;
		for (let i = 0; i < numberOfComponents; i += 1) {
			gestureComponents.push({
				rx:
					(seededRandom() * Math.min(canvasAreaRect.width, canvasAreaRect.height)) /
					2 /
					numberOfComponents,
				ry:
					(seededRandom() * Math.min(canvasAreaRect.width, canvasAreaRect.height)) /
					2 /
					numberOfComponents,
				angularFactor: seededRandom() * 5 - seededRandom(),
				angularOffset: seededRandom() * 5 - seededRandom(),
			});
		}
		const stepsInGesture = 50;
		let pointForTimeWithArbitraryStart = (t) => {
			let point = { x: 0, y: 0 };
			for (let i = 0; i < gestureComponents.length; i += 1) {
				let { rx, ry, angularFactor, angularOffset } = gestureComponents[i];
				point.x +=
					Math.sin(Math.PI * 2 * ((t / 2) * angularFactor + angularOffset)) *
					rx;
				point.y +=
					Math.cos(Math.PI * 2 * ((t / 2) * angularFactor + angularOffset)) *
					ry;
			}
			return point;
		};
		let pointForTime = (t) => {
			let point = pointForTimeWithArbitraryStart(t);
			let zeroPoint = pointForTimeWithArbitraryStart(0);
			point.x -= zeroPoint.x;
			point.y -= zeroPoint.y;
			point.x += startPointX;
			point.y += startPointY;
			return point;
		};

		triggerMouseEvent("pointerenter", pointForTime(t)); // so dynamic cursors follow the simulation cursor
		triggerMouseEvent("pointerdown", pointForTime(t));
		let move = () => {
			t += 1 / stepsInGesture;
			if (seededRandom() < shiftToggleChance) {
				shift = !shift;
			}
			if (seededRandom() < secondaryToggleChance) {
				secondary = !secondary;
			}
			if (t > 1) {
				triggerMouseEvent("pointerup", pointForTime(t));

				$cursor.remove();

				if (callback) {
					callback();
				}
			} else {
				triggerMouseEvent("pointermove", pointForTime(t));
				gestureTimeoutID = setTimeout(move, 10);
			}
		};
		triggerMouseEvent("pointerleave", pointForTime(t));
		move();
	};

	exports.simulateRandomGesturesPeriodically = () => {
		exports.simulatingGestures = true;

		if (window.drawRandomlySeed != null) {
			seed = window.drawRandomlySeed;
		} else {
			seed = ~~(Math.random() * 5000000);
		}
		window.console && console.log("Using seed:", seed);
		window.console && console.log("Note: Seeds are not guaranteed to work with different versions of the app, but within the same version it should produce the same results given the same starting document & other state & NO interference... except for airbrush randomness");
		window.console && console.log(`To use this seed:

			window.drawRandomlySeed = ${seed};
			document.body.style.width = "${getComputedStyle(document.body).width}";
			document.body.style.height = "${getComputedStyle(document.body).height}";
			simulateRandomGesturesPeriodically();
			delete window.drawRandomlySeed;

		`);

		let delayBetweenGestures = 500;
		let shiftStart = false;
		let shiftStartToggleChance = 0.1;
		let shiftToggleChance = 0.001;
		let secondaryStart = false;
		let secondaryStartToggleChance = 0.1;
		let secondaryToggleChance = 0.001;
		let switchToolsChance = 0.5;
		let multiToolsChance = 0.8;
		let pickColorChance = 0.5;
		let pickToolOptionsChance = 0.8;
		let scrollChance = 0.2;
		let dragSelectionChance = 0.8;

		// scroll randomly absolutely initially so the starting scroll doesn't play into whether a seed reproduces
		$canvas_area.scrollTop($canvas_area.width() * seededRandom());
		$canvas_area.scrollLeft($canvas_area.height() * seededRandom());

		let _simulateRandomGesture = (callback) => {
			exports.simulateRandomGesture(callback, {
				shift: shiftStart,
				shiftToggleChance,
				secondary: secondaryStart,
				secondaryToggleChance
			});
		};
		let waitThenGo = () => {
			// @TODO: a button to stop it as well (maybe make "stop drawing randomly" a link button?)
			$status_text.text("Press Esc to stop drawing randomly.");
			if (isAnyMenuOpen()) {
				periodicGesturesTimeoutID = setTimeout(waitThenGo, 50);
				return;
			}

			if (seededRandom() < shiftStartToggleChance) {
				shiftStart = !shiftStart;
			}
			if (seededRandom() < secondaryStartToggleChance) {
				secondaryStart = !secondaryStart;
			}
			if (seededRandom() < switchToolsChance) {
				let multiToolsPlz = seededRandom() < multiToolsChance;
				$(choose($(".tool, tool-button"))).trigger($.Event("click", { shiftKey: multiToolsPlz }));
			}
			if (seededRandom() < pickToolOptionsChance) {
				$(choose($(".tool-options *"))).trigger("click");
			}
			if (seededRandom() < pickColorChance) {
				// @TODO: maybe these should respond to a normal click?
				let secondary = seededRandom() < 0.5;
				const colorButton = choose($(".swatch, .color-button"));
				$(colorButton)
					.trigger($.Event("pointerdown", { button: secondary ? 2 : 0 }))
					.trigger($.Event("click", { button: secondary ? 2 : 0 }))
					.trigger($.Event("pointerup", { button: secondary ? 2 : 0 }));
			}
			if (seededRandom() < scrollChance) {
				let scrollAmount = (seededRandom() * 2 - 1) * 700;
				if (seededRandom() < 0.5) {
					$canvas_area.scrollTop($canvas_area.scrollTop() + scrollAmount);
				} else {
					$canvas_area.scrollLeft($canvas_area.scrollLeft() + scrollAmount);
				}
			}
			periodicGesturesTimeoutID = setTimeout(() => {
				_simulateRandomGesture(() => {
					if (selection && seededRandom() < dragSelectionChance) {
						exports.simulateRandomGesture(waitThenGo, {
							shift: shiftStart,
							shiftToggleChance,
							secondary: secondaryStart,
							secondaryToggleChance,
							target: selection.canvas
						});
					} else {
						waitThenGo();
					}
				});
			}, delayBetweenGestures);
		};
		_simulateRandomGesture(waitThenGo);
	};

	exports.stopSimulatingGestures = () => {
		if (exports.simulatingGestures) {
			clearTimeout(gestureTimeoutID);
			clearTimeout(periodicGesturesTimeoutID);
			exports.simulatingGestures = false;
			$status_text.default();
			$cursor.remove();
			cancel();
		}
		document.body.style.width = "";
		document.body.style.height = "";
	};

})(window);
