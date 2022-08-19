((exports) => {
	// Note that this API must be kept in sync with the version in 98.js.org.

	try {
		// <audio> element is simpler for sound effects,
		// but in iOS/iPad it shows up in the Control Center, as if it's music you'd want to play/pause/etc.
		// It's very silly. Also, on subsequent plays, it only plays part of the sound.
		// And Web Audio API is better for playing SFX anyway because it can play a sound overlapping with itself.
		window.audioContext = window.audioContext || new AudioContext();
		const audio_buffer_promise =
			fetch("audio/chord.wav")
				.then(response => response.arrayBuffer())
				.then(array_buffer => audioContext.decodeAudioData(array_buffer))
		var play_chord = async function () {
			audioContext.resume(); // in case it was not allowed to start until a user interaction
			// Note that this should be before waiting for the audio buffer,
			// so that it works the first time.
			// (This only works if the message box is opened during a user gesture.)

			const audio_buffer = await audio_buffer_promise;
			const source = audioContext.createBufferSource();
			source.buffer = audio_buffer;
			source.connect(audioContext.destination);
			source.start();
		};
	} catch (error) {
		console.log("AudioContext not supported", error);
	}

	function showMessageBox({
		title = window.defaultMessageBoxTitle ?? "Alert",
		message,
		messageHTML,
		buttons = [{ label: "OK", value: "ok", default: true }],
		iconID = "warning", // "error", "warning", "info", or "nuke" for deleting files/folders
		windowOptions = {}, // for controlling width, etc.
	}) {
		let $window, $message;
		const promise = new Promise((resolve, reject) => {
			$window = make_window_supporting_scale(Object.assign({
				title,
				resizable: false,
				innerWidth: 400,
				maximizeButton: false,
				minimizeButton: false,
			}, windowOptions));
			// $window.addClass("dialog-window horizontal-buttons");
			$message =
				$("<div>").css({
					textAlign: "left",
					fontFamily: "MS Sans Serif, Arial, sans-serif",
					fontSize: "14px",
					marginTop: "22px",
					flex: 1,
					minWidth: 0, // Fixes hidden overflow, see https://css-tricks.com/flexbox-truncated-text/
					whiteSpace: "normal", // overriding .window:not(.squish)
				});
			if (messageHTML) {
				$message.html(messageHTML);
			} else if (message) { // both are optional because you may populate later with dynamic content
				$message.text(message).css({
					whiteSpace: "pre-wrap",
					wordWrap: "break-word",
				});
			}
			$("<div>").append(
				$("<img width='32' height='32'>").attr("src", `images/${iconID}-32x32-8bpp.png`).css({
					margin: "16px",
					display: "block",
				}),
				$message
			).css({
				display: "flex",
				flexDirection: "row",
			}).appendTo($window.$content);

			$window.$content.css({
				textAlign: "center",
			});
			for (const button of buttons) {
				const $button = $window.$Button(button.label, () => {
					button.action?.(); // API may be required for using user gesture requiring APIs
					resolve(button.value);
					$window.close(); // actually happens automatically
				});
				if (button.default) {
					$button.addClass("default");
					$button.focus();
					setTimeout(() => $button.focus(), 0); // @TODO: why is this needed? does it have to do with the iframe window handling?
				}
				$button.css({
					minWidth: 75,
					height: 23,
					margin: "16px 2px",
				});
			}
			$window.on("focusin", "button", (event) => {
				$(event.currentTarget).addClass("default");
			});
			$window.on("focusout", "button", (event) => {
				$(event.currentTarget).removeClass("default");
			});
			$window.on("closed", () => {
				resolve("closed"); // or "cancel"? do you need to distinguish?
			});
			$window.center();
		});
		promise.$window = $window;
		promise.$message = $message;
		promise.promise = promise; // for easy destructuring
		try {
			play_chord();
		} catch (error) {
			console.log(`Failed to play ${chord_audio.src}: `, error);
		}
		return promise;
	}

	// Prefer a function injected from outside an iframe,
	// which will make dialogs that can go outside the iframe,
	// for 98.js.org integration.
	// exports.showMessageBox = window.showMessageBox;
	exports.showMessageBox = exports.showMessageBox || showMessageBox;
})(window);

// Note `defaultMessageBoxTitle` handling in make_iframe_window
// Any other default parameters need to be handled there (as it works now)

window.defaultMessageBoxTitle = localize("Paint");

// Don't override alert, because I only use it as a fallback for global error handling.
// If make_window_supporting_scale is not defined, then alert is used instead,
// so it must not also end up calling make_window_supporting_scale.
// More generally, if there's an error in showMessageBox, it must fall back to something that does not use showMessageBox.
// window.alert = (message) => {
// 	showMessageBox({ message });
// };
