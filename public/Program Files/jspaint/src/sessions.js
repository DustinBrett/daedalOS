
(() => {

	const log = (...args) => {
		window.console && console.log(...args);
	};

	let localStorageAvailable = false;
	try {
		localStorage._available = true;
		localStorageAvailable = localStorage._available;
		delete localStorage._available;
		// eslint-disable-next-line no-empty
	} catch (e) { }

	// @TODO: keep other data in addition to the image data
	// such as the file_name and other state
	// (maybe even whether it's considered saved? idk about that)
	// I could have the image in one storage slot and the state in another

	const match_threshold = 1; // 1 is just enough for a workaround for Brave browser's farbling: https://github.com/1j01/jspaint/issues/184
	const canvas_has_any_apparent_image_data = () =>
		main_canvas.ctx.getImageData(0, 0, main_canvas.width, main_canvas.height).data.some((v) => v > match_threshold);

	let $recovery_window;
	function show_recovery_window(no_longer_blank) {
		$recovery_window && $recovery_window.close();
		const $w = $recovery_window = $DialogWindow();
		$w.on("close", () => {
			$recovery_window = null;
		});
		$w.title("Recover Document");
		let backup_impossible = false;
		try { window.localStorage } catch (e) { backup_impossible = true; }
		$w.$main.append($(`
			<h1>Woah!</h1>
			<p>Your browser may have cleared the canvas due to memory usage.</p>
			<p>Undo to recover the document, and remember to save with <b>File > Save</b>!</p>
			${backup_impossible ?
				"<p><b>Note:</b> No automatic backup is possible unless you enable Cookies in your browser.</p>"
				: (
					no_longer_blank ?
						`<p>
							<b>Note:</b> normally a backup is saved automatically,<br>
							but autosave is paused while this dialog is open<br>
							to avoid overwriting the (singular) backup.
						</p>
						<p>
							(See <b>File &gt; Manage Storage</b> to view backups.)
						</p>`
						: ""
				)
			}
		`));

		const $undo = $w.$Button("Undo", () => {
			undo();
		});
		const $redo = $w.$Button("Redo", () => {
			redo();
		});
		const update_buttons_disabled = () => {
			$undo.attr("disabled", undos.length < 1);
			$redo.attr("disabled", redos.length < 1);
		};
		$G.on("session-update.session-hook", update_buttons_disabled);
		update_buttons_disabled();

		$w.$Button(localize("Close"), () => {
			$w.close();
		});
		$w.center();

		$w.find("button:enabled").focus();
	}

	let last_undos_length = undos.length;
	function handle_data_loss() {
		const window_is_open = $recovery_window && !$recovery_window.closed;
		let save_paused = false;
		if (!canvas_has_any_apparent_image_data()) {
			if (!window_is_open) {
				show_recovery_window();
			}
			save_paused = true;
		} else if (window_is_open) {
			if (undos.length > last_undos_length) {
				show_recovery_window(true);
			}
			save_paused = true;
		}
		last_undos_length = undos.length;
		return save_paused;
	}

	class LocalSession {
		constructor(session_id) {
			this.id = session_id;
			const lsid = `image#${session_id}`;
			log(`Local storage ID: ${lsid}`);
			// save image to storage
			this.save_image_to_storage_immediately = () => {
				const save_paused = handle_data_loss();
				if (save_paused) {
					return;
				}
				log(`Saving image to storage: ${lsid}`);
				storage.set(lsid, main_canvas.toDataURL("image/png"), err => {
					if (err) {
						if (err.quotaExceeded) {
							storage_quota_exceeded();
						}
						else {
							// e.g. localStorage is disabled
							// (or there's some other error?)
							// @TODO: show warning with "Don't tell me again" type option
						}
					}
				});
			};
			this.save_image_to_storage_soon = debounce(this.save_image_to_storage_immediately, 100);
			storage.get(lsid, (err, uri) => {
				if (err) {
					if (localStorageAvailable) {
						show_error_message("Failed to retrieve image from local storage.", err);
					}
					else {
						// @TODO: DRY with storage manager message
						showMessageBox({
							message: "Please enable local storage in your browser's settings for local backup. It may be called Cookies, Storage, or Site Data.",
						});
					}
				}
				else if (uri) {
					load_image_from_uri(uri).then((info) => {
						open_from_image_info(info, null, null, true, true);
					}, (error) => {
						show_error_message("Failed to open image from local storage.", error);
					});
				}
				else {
					// no uri so lets save the blank canvas
					this.save_image_to_storage_soon();
				}
			});
			$G.on("session-update.session-hook", this.save_image_to_storage_soon);
		}
		end() {
			// Skip debounce and save immediately
			this.save_image_to_storage_soon.cancel();
			this.save_image_to_storage_immediately();
			// Remove session-related hooks
			$G.off(".session-hook");
		}
	}


	// The user ID is not persistent
	// A person can enter a session multiple times,
	// and is always given a new user ID
	let user_id;
	// @TODO: I could make the color persistent, though.
	// You could still have multiple cursors and they would just be the same color.
	// There could also be an option to change your color

	// The data in this object is stored in the server when you enter a session
	// It is (supposed to be) removed when you leave
	const user = {
		// Cursor status
		cursor: {
			// cursor position in canvas coordinates
			x: 0, y: 0,
			// whether the user is elsewhere, such as in another tab
			away: true,
		},
		// Currently selected tool (@TODO)
		tool: localize("Pencil"),
		// Color components
		hue: ~~(Math.random() * 360),
		saturation: ~~(Math.random() * 50) + 50,
		lightness: ~~(Math.random() * 40) + 50,
	};

	// The main cursor color
	user.color = `hsla(${user.hue}, ${user.saturation}%, ${user.lightness}%, 1)`;
	// Unused
	user.color_transparent = `hsla(${user.hue}, ${user.saturation}%, ${user.lightness}%, 0.5)`;
	// (@TODO) The color (that may be) used in the toolbar indicating to other users it is selected by this user
	user.color_desaturated = `hsla(${user.hue}, ${~~(user.saturation * 0.4)}%, ${user.lightness}%, 0.8)`;


	// The image used for other people's cursors
	const cursor_image = new Image();
	cursor_image.src = "images/cursors/default.png";


	class MultiUserSession {
		constructor(session_id) {
			this.id = session_id;
			this._fb_listeners = [];

			file_name = `[Loading ${this.id}]`;
			update_title();
			const on_firebase_loaded = () => {
				file_name = `[${this.id}]`;
				update_title();
				this.start();
			};
			if (!MultiUserSession.fb_root) {
				var script = document.createElement("script");
				script.addEventListener("load", () => {
					const config = {
						apiKey: "AIzaSyBgau8Vu9ZE8u_j0rp-Lc044gYTX5O3X9k",
						authDomain: "jspaint.firebaseapp.com",
						databaseURL: "https://jspaint.firebaseio.com",
						projectId: "firebase-jspaint",
						storageBucket: "",
						messagingSenderId: "63395010995"
					};
					firebase.initializeApp(config);
					MultiUserSession.fb_root = firebase.database().ref("/");
					on_firebase_loaded();
				});
				script.addEventListener("error", () => {
					show_error_message("Failed to load Firebase; the document will not load, and changes will not be saved.");
					file_name = `[Failed to load ${this.id}]`;
					update_title();
				});
				script.src = "lib/firebase.js";
				document.head.appendChild(script);
			}
			else {
				on_firebase_loaded();
			}
		}
		start() {
			// @TODO: how do you actually detect if it's failing???
			showMessageBox({
				messageHTML: `
					<p>The document may not load. Changes may not save.</p>
					<p>Multiuser sessions are public. There is no security.</p>
				`
			});
			// "<p>The document may not load. Changes may not save. If it does save, it's public. There is no security.</p>"// +
			// "<p>I haven't found a way to detect Firebase quota limits being exceeded, " +
			// "so for now I'm showing this message regardless of whether it's working.</p>" +
			// "<p>If you're interested in using multiuser mode, please thumbs-up " +
			// "<a href='https://github.com/1j01/jspaint/issues/68'>this issue</a> to show interest, and/or subscribe for updates.</p>"

			// Wrap the Firebase API because they don't
			// provide a great way to clean up event listeners
			const _fb_on = (fb, event_type, callback, error_callback) => {
				this._fb_listeners.push({ fb, event_type, callback, error_callback });
				fb.on(event_type, callback, error_callback);
			};
			// Get Firebase references
			this.fb = MultiUserSession.fb_root.child(this.id);
			this.fb_data = this.fb.child("data");
			this.fb_users = this.fb.child("users");
			if (user_id) {
				this.fb_user = this.fb_users.child(user_id);
			}
			else {
				this.fb_user = this.fb_users.push();
				user_id = this.fb_user.key;
			}
			// Remove the user from the session when they disconnect
			this.fb_user.onDisconnect().remove();
			// Make the user present in the session
			this.fb_user.set(user);
			// @TODO: Execute the above two lines when .info/connected
			// For each existing and new user
			_fb_on(this.fb_users, "child_added", snap => {
				// Is this you?
				if (snap.key === user_id) {
					// You already have a cursor.
					return;
				}
				// Get the Firebase reference for this user
				const fb_other_user = snap.ref;
				// Get the user object stored on the server
				let other_user = snap.val();
				// @TODO: display other cursor types?
				// @TODO: display pointer button state?
				// @TODO: display selections
				const cursor_canvas = make_canvas(32, 32);
				// Make the cursor element
				const $cursor = $(cursor_canvas).addClass("user-cursor").appendTo($app);
				$cursor.css({
					display: "none",
					position: "absolute",
					left: 0,
					top: 0,
					opacity: 0,
					zIndex: 5, // @#: z-index
					pointerEvents: "none",
					transition: "opacity 0.5s",
				});
				// When the cursor data changes
				_fb_on(fb_other_user, "value", snap => {
					other_user = snap.val();
					// If the user has left
					if (other_user == null) {
						// Remove the cursor element
						$cursor.remove();
					}
					else {
						// Draw the cursor
						const draw_cursor = () => {
							cursor_canvas.width = cursor_image.width;
							cursor_canvas.height = cursor_image.height;
							const cursor_ctx = cursor_canvas.ctx;
							cursor_ctx.fillStyle = other_user.color;
							cursor_ctx.fillRect(0, 0, cursor_canvas.width, cursor_canvas.height);
							cursor_ctx.globalCompositeOperation = "multiply";
							cursor_ctx.drawImage(cursor_image, 0, 0);
							cursor_ctx.globalCompositeOperation = "destination-atop";
							cursor_ctx.drawImage(cursor_image, 0, 0);
						};
						if (cursor_image.complete) {
							draw_cursor();
						}
						else {
							$(cursor_image).one("load", draw_cursor);
						}
						// Update the cursor element
						const canvas_rect = canvas_bounding_client_rect;
						$cursor.css({
							display: "block",
							position: "absolute",
							left: canvas_rect.left + magnification * other_user.cursor.x,
							top: canvas_rect.top + magnification * other_user.cursor.y,
							opacity: 1 - other_user.cursor.away,
						});
					}
				});
			});
			let previous_uri;
			// let pointer_operations = []; // the multiplayer syncing stuff is a can of worms, so this is disabled
			this.write_canvas_to_database_immediately = () => {
				const save_paused = handle_data_loss();
				if (save_paused) {
					return;
				}
				// Sync the data from this client to the server (one-way)
				const uri = main_canvas.toDataURL();
				if (previous_uri !== uri) {
					// log("clear pointer operations to set data", pointer_operations);
					// pointer_operations = [];
					log("Write canvas data to Firebase");
					this.fb_data.set(uri);
					previous_uri = uri;
				}
				else {
					log("(Don't write canvas data to Firebase; it hasn't changed)");
				}
			};
			this.write_canvas_to_database_soon = debounce(this.write_canvas_to_database_immediately, 100);
			let ignore_session_update = false;
			$G.on("session-update.session-hook", () => {
				if (ignore_session_update) {
					log("(Ignore session-update from Sync Session undoable)");
					return;
				}
				this.write_canvas_to_database_soon();
			});
			// Any time we change or receive the image data
			_fb_on(this.fb_data, "value", snap => {
				log("Firebase data update");
				const uri = snap.val();
				if (uri == null) {
					// If there's no value at the data location, this is a new session
					// Sync the current data to it
					this.write_canvas_to_database_soon();
				}
				else {
					previous_uri = uri;
					// Load the new image data
					const img = new Image();
					img.onload = () => {
						// Cancel any in-progress pointer operations
						// if (pointer_operations.length) {
						// 	$G.triggerHandler("pointerup", "cancel");
						// }

						const test_canvas = make_canvas(img);
						const image_data_remote = test_canvas.ctx.getImageData(0, 0, test_canvas.width, test_canvas.height);
						const image_data_local = main_ctx.getImageData(0, 0, main_canvas.width, main_canvas.height);

						if (!image_data_match(image_data_remote, image_data_local, 5)) {
							ignore_session_update = true;
							undoable({
								name: "Sync Session",
								icon: get_help_folder_icon("p_database.png"),
							}, () => {
								// Write the image data to the canvas
								main_ctx.copy(img);
								$canvas_area.trigger("resize");
							});
							ignore_session_update = false;
						}

						// (transparency = has_any_transparency(main_ctx); here would not be ideal
						// Perhaps a better way of syncing transparency
						// and other options will be established)
						/*
						// Playback recorded in-progress pointer operations
						log("Playback", pointer_operations);

						for (const e of pointer_operations) {
							// Trigger the event at each place it is listened for
							$canvas.triggerHandler(e, ["synthetic"]);
							$G.triggerHandler(e, ["synthetic"]);
						}
						*/
					};
					img.src = uri;
				}
			}, error => {
				show_error_message("Failed to retrieve data from Firebase. The document will not load, and changes will not be saved.", error);
				file_name = `[Failed to load ${this.id}]`;
				update_title();
			});
			// Update the cursor status
			$G.on("pointermove.session-hook", e => {
				const m = to_canvas_coords(e);
				this.fb_user.child("cursor").update({
					x: m.x,
					y: m.y,
					away: false,
				});
			});
			$G.on("blur.session-hook", () => {
				this.fb_user.child("cursor").update({
					away: true,
				});
			});
			// @FIXME: the cursor can come back from "away" via a pointer event
			// while the window is blurred and stay there when the user goes away
			// maybe replace "away" with a timestamp of activity and then
			// clients can decide whether a given cursor should be visible

			/*
			const debug_event = (e, synthetic) => {
				// const label = synthetic ? "(synthetic)" : "(normal)";
				// window.console && console.debug && console.debug(e.type, label);
			};

			$canvas_area.on("pointerdown.session-hook", "*", (e, synthetic) => {
				debug_event(e, synthetic);
				if (synthetic) { return; }

				pointer_operations = [e];
				const pointermove = (e, synthetic) => {
					debug_event(e, synthetic);
					if (synthetic) { return; }

					pointer_operations.push(e);
				};
				$G.on("pointermove.session-hook", pointermove);
				$G.one("pointerup.session-hook", (e, synthetic) => {
					debug_event(e, synthetic);
					if (synthetic) { return; }

					$G.off("pointermove.session-hook", pointermove);
				});
			});
			*/
		}
		end() {
			// Skip debounce and save immediately
			this.write_canvas_to_database_soon.cancel();
			this.write_canvas_to_database_immediately();
			// Remove session-related hooks
			$G.off(".session-hook");
			// $canvas_area.off("pointerdown.session-hook");
			// Remove collected Firebase event listeners
			this._fb_listeners.forEach(({ fb, event_type, callback/*, error_callback*/ }) => {
				log(`Remove listener for ${fb.path.toString()} .on ${event_type}`);
				fb.off(event_type, callback);
			});
			this._fb_listeners.length = 0;
			// Remove the user from the session
			this.fb_user.remove();
			// Remove any cursor elements
			$app.find(".user-cursor").remove();
			// Reset to "untitled"
			reset_file();
		}
	}



	// Handle the starting, switching, and ending of sessions from the location.hash

	let current_session;
	const end_current_session = () => {
		if (current_session) {
			log("Ending current session");
			current_session.end();
			current_session = null;
		}
	};
	const generate_session_id = () => (Math.random() * (2 ** 32)).toString(16).replace(".", "");
	const update_session_from_location_hash = () => {
		const session_match = location.hash.match(/^#?(?:.*,)?(session|local):(.*)$/i);
		const load_from_url_match = location.hash.match(/^#?(?:.*,)?(load):(.*)$/i);
		if (session_match) {
			const local = session_match[1].toLowerCase() === "local";
			const session_id = session_match[2];
			if (session_id === "") {
				log("Invalid session ID; session ID cannot be empty");
				end_current_session();
			} else if (!local && session_id.match(/[./[\]#$]/)) {
				log("Session ID is not a valid Firebase location; it cannot contain any of ./[]#$");
				end_current_session();
			} else if (!session_id.match(/[-0-9A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02af\u1d00-\u1d25\u1d62-\u1d65\u1d6b-\u1d77\u1d79-\u1d9a\u1e00-\u1eff\u2090-\u2094\u2184-\u2184\u2488-\u2490\u271d-\u271d\u2c60-\u2c7c\u2c7e-\u2c7f\ua722-\ua76f\ua771-\ua787\ua78b-\ua78c\ua7fb-\ua7ff\ufb00-\ufb06]+/)) {
				log("Invalid session ID; it must consist of 'alphanumeric-esque' characters");
				end_current_session();
			} else if (
				current_session && current_session.id === session_id &&
				local === (current_session instanceof LocalSession)
			) {
				log("Hash changed but the session ID and session type are the same");
			} else {
				// @TODO: Ask if you want to save before starting a new session
				end_current_session();
				if (local) {
					log(`Starting a new LocalSession, ID: ${session_id}`);
					current_session = new LocalSession(session_id);
				} else {
					log(`Starting a new MultiUserSession, ID: ${session_id}`);
					current_session = new MultiUserSession(session_id);
				}
			}
		} else if (load_from_url_match) {
			const url = decodeURIComponent(load_from_url_match[2]);

			const uris = get_uris(url);
			if (uris.length === 0) {
				show_error_message("Invalid URL to load (after #load: in the address bar). It must include a protocol (https:// or http://)");
				return;
			}

			log("Switching to new session from #load: URL (to #local: URL with session ID)");
			// Note: could use into_existing_session=false on open_from_image_info instead of creating the new session beforehand
			end_current_session();
			change_url_param("local", generate_session_id());

			load_image_from_uri(url).then((info) => {
				open_from_image_info(info, null, null, true, true);
			}, show_resource_load_error_message);

		} else {
			log("No session ID in hash");
			const old_hash = location.hash;
			end_current_session();
			change_url_param("local", generate_session_id(), { replace_history_state: true });
			log("After replaceState:", location.hash);
			if (old_hash === location.hash) {
				// e.g. on Wayback Machine
				show_error_message("Autosave is disabled. Failed to update URL to start session.");
			} else {
				update_session_from_location_hash();
			}
		}
	};

	$G.on("hashchange popstate change-url-params", e => {
		log(e.type, location.hash);
		update_session_from_location_hash();
	});
	log("Initializing with location hash:", location.hash);
	update_session_from_location_hash();

	window.new_local_session = () => {
		end_current_session();
		log("Changing URL to start new session...");
		change_url_param("local", generate_session_id());
	};

	// @TODO: Session GUI
	// @TODO: Indicate when the session ID is invalid
	// @TODO: Indicate when the session switches

	// @TODO: Indicate when there is no session!
	// Probably in app.js so as to handle the possibility of sessions.js failing to load.
})();
