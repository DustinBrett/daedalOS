(() => {
	let rAF_ID, rotologo, $window, space_phase_key_handler, player, player_placeholder;
	let vaporwave_active = false;

	if (parent && frameElement && parent.$) {
		$window = parent.$(frameElement).closest(".window");
	} else {
		$window = $();
	}

	const wait_for_youtube_api = callback => {
		if (typeof YT !== "undefined") {
			callback();
		} else {
			const tag = document.createElement('script');
			tag.src = "https://www.youtube.com/player_api";
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			// The YouTube API will call this global function when loaded and ready.
			window.onYouTubeIframeAPIReady = () => {
				callback();
			};
		}
	};

	const stop_vaporwave = () => {
		vaporwave_active = false;

		cancelAnimationFrame(rAF_ID);

		$(rotologo).remove();
		$window.css({ transform: "" });

		removeEventListener("keydown", space_phase_key_handler);
		if (player) {
			player.destroy();
			player = null;
		}
		$(player_placeholder).remove();

		// vaporwave is dead. long live vaporwave.
		// bepis pepsi isded pepsi isded
	};

	const start_vaporwave = () => {
		vaporwave_active = true;

		rotologo = document.createElement("img");
		rotologo.classList.add("rotologo");
		if (frameElement) {
			frameElement.parentElement.appendChild(rotologo);
			rotologo.src = "images/logo/98.js.org.svg";
		} else {
			document.body.appendChild(rotologo);
			rotologo.src = "images/98.js.org.svg";
		}

		$(rotologo).css({
			position: "absolute",
			left: "50%",
			top: "50%",
			pointerEvents: "none",
			transformOrigin: "0% 0%",
			transition: "opacity 1s ease",
			opacity: "0",
		});

		const animate = () => {
			rAF_ID = requestAnimationFrame(animate);

			// @TODO: slow down and stop when you pause?
			const turns = Math.sin(Date.now() / 5000);
			const hueTurns = Math.sin(Date.now() / 4000);
			$(rotologo).css({
				transform: `perspective(4000px) rotateY(${turns}turn) translate(-50%, -50%) translateZ(500px)`,
				filter: `hue-rotate(${hueTurns}turn)`,
			});

			if ($window.length) {
				let el = $window[0];
				let offsetLeft = 0;
				let offsetTop = 0;
				do {
					offsetLeft += el.offsetLeft;
					offsetTop += el.offsetTop;
					el = el.offsetParent;
				} while (el);

				const rotateY = -(offsetLeft + ($window.outerWidth() - parent.innerWidth) / 2) / parent.innerWidth / 3;
				const rotateX = (offsetTop + ($window.outerHeight() - parent.innerHeight) / 2) / parent.innerHeight / 3;
				$window.css({
					transform: `perspective(4000px) rotateY(${rotateY}turn) rotateX(${rotateX}turn)`,
					transformOrigin: "50% 50%",
					transformStyle: "preserve-3d",
					// @FIXME: interactivity problems (with order elements are considered to have), I think related to preserve-3d
				});
			}
		};
		animate();

		player_placeholder = document.createElement("div");
		document.querySelector(".canvas-area").appendChild(player_placeholder);
		$(player_placeholder).css({
			position: "absolute",
			top: "3px", // @TODO: dynamic
			left: "3px",
			mixBlendMode: "multiply",
			pointerEvents: "none",
			transition: "opacity 0.4s ease",
			width: "100vw",
			height: "100vh",
		});
		// NOTE: placeholder not a container; the YT API replaces the element passed in the DOM
		// but keeps inline styles apparently, and maybe other things, I don't know; it's weird

		wait_for_youtube_api(() => {
			player = new YT.Player(player_placeholder, {
				height: "390",
				width: "640",
				videoId: "8TvcyPCgKSU",
				playerVars: {
					autoplay: 1,
					controls: 0,
				},
				events: {
					onReady: onPlayerReady,
					onStateChange: onPlayerStateChange,
				},
			});
			// @TODO: attribution for this video!
			// I mean, you can see the title if you hit spacebar, but
			// I could make it wave across the screen behind Paint on the desktop
			// I could add a "Song Name?" button that responds "Darude Sandstorm"
			// I could add a "Song At 420?" button that actually links to the video
			// some number of those things or something like that
		});

		// The API will call this function when the video player is ready.
		function onPlayerReady(/*event*/) {
			player.playVideo();
			player.unMute();
		}

		// The API calls this function when the player's state changes.
		function onPlayerStateChange(event) {
			if (event.data == YT.PlayerState.PLAYING) {
				// @TODO: pause and resume this timer with the video
				setTimeout(() => {
					$(rotologo).css({ opacity: 1 });
				}, 14150);
			}
			if (event.data == YT.PlayerState.ENDED) {
				player.destroy();
				player = null;
				// @TODO: fade to white instead of black, to work with the multiply effect
				// or fade out opacity alternatively
				// setTimeout/setInterval and check player.getCurrentTime() for when near the end?
				// or we might switch to using soundcloud for the audio and so trigger it with that, with a separate video of just clouds
				// also fade out the rotologo earlier
				$(rotologo).css({ opacity: 0 });
				// destroy rotologo once faded out
				setTimeout(stop_vaporwave, 1200);
			}
		}

		let is_theoretically_playing = true;
		space_phase_key_handler = e => {
			// press space to phase in and out of space phase スペース相 - windows 98 マイクロソフト 『ＷＩＮＴＲＡＰ』 X 将来のオペレーティングシステムサウンド 1998 VAPORWAVE
			if (e.which === 32) {
				// @TODO: record player SFX
				if (is_theoretically_playing) {
					player.pauseVideo();
					is_theoretically_playing = false;
					$(player.getIframe())
						.add(rotologo)
						.css({ opacity: "0" });
				} else {
					player.playVideo();
					is_theoretically_playing = true;
					$(player.getIframe())
						.add(rotologo)
						.css({ opacity: "" });
				}
				e.preventDefault();
				// player.getIframe().focus();
			}
		};
		addEventListener("keydown", space_phase_key_handler);
	};

	const toggle_vaporwave = () => {
		if (vaporwave_active) {
			stop_vaporwave();
		} else {
			start_vaporwave();
		}
	};

	addEventListener("keydown", Konami.code(toggle_vaporwave));
	addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			stop_vaporwave();
		}
	});

})();
