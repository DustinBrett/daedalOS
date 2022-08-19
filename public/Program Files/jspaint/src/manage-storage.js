((exports) => {

	let $storage_manager;
	let $quota_exceeded_window;
	let ignoring_quota_exceeded = false;

	async function storage_quota_exceeded() {
		if ($quota_exceeded_window) {
			$quota_exceeded_window.close();
			$quota_exceeded_window = null;
		}
		if (ignoring_quota_exceeded) {
			return;
		}
		const { promise, $window } = showMessageBox({
			title: "Storage Error",
			messageHTML: `
			<p>JS Paint stores images as you work on them so that if you close your browser or tab or reload the page your images are usually safe.</p>
			<p>However, it has run out of space to do so.</p>
			<p>You can still save the current image with <b>File > Save</b>. You should save frequently, or free up enough space to keep the image safe.</p>
		`,
			buttons: [
				{ label: "Manage Storage", value: "manage", default: true },
				{ label: "Ignore", value: "ignore" },
			],
			iconID: "warning",
		});
		$quota_exceeded_window = $window;
		const result = await promise;
		if (result === "ignore") {
			ignoring_quota_exceeded = true;
		} else if (result === "manage") {
			ignoring_quota_exceeded = false;
			manage_storage();
		}
	}

	function manage_storage() {
		if ($storage_manager) {
			$storage_manager.close();
		}
		$storage_manager = $DialogWindow().title("Manage Storage").addClass("storage-manager squish");
		// @TODO: way to remove all (with confirmation)
		const $table = $(E("table")).appendTo($storage_manager.$main);
		const $message = $(E("p")).appendTo($storage_manager.$main).html(
			"Any images you've saved to your computer with <b>File > Save</b> will not be affected."
		);
		$storage_manager.$Button("Close", () => {
			$storage_manager.close();
		});

		const addRow = (k, imgSrc) => {
			const $tr = $(E("tr")).appendTo($table);

			const $img = $(E("img")).attr({ src: imgSrc }).addClass("thumbnail-img");
			const $remove = $(E("button")).text("Remove").addClass("remove-button");
			const href = `#${k.replace("image#", "local:")}`;
			const $open_link = $(E("a")).attr({ href, target: "_blank" }).text(localize("Open"));
			const $thumbnail_open_link = $(E("a")).attr({ href, target: "_blank" }).addClass("thumbnail-container");
			$thumbnail_open_link.append($img);
			$(E("td")).append($thumbnail_open_link).appendTo($tr);
			$(E("td")).append($open_link).appendTo($tr);
			$(E("td")).append($remove).appendTo($tr);

			$remove.on("click", () => {
				localStorage.removeItem(k);
				$tr.remove();
				if ($table.find("tr").length == 0) {
					$message.html("<p>All clear!</p>");
				}
			});
		};

		let localStorageAvailable = false;
		try {
			if (localStorage.length > 0) {
				// This is needed in case it's COMPLETELY full.
				// Test with https://stackoverflow.com/questions/45760110/how-to-fill-javascript-localstorage-to-its-max-capacity-quickly
				// Of course, this dialog only manages images, not other data (for now anyway).
				localStorageAvailable = true;
			} else {
				localStorage._available = true;
				localStorageAvailable = localStorage._available;
				delete localStorage._available;
			}
			// eslint-disable-next-line no-empty
		} catch (e) { }

		if (localStorageAvailable) {
			for (const k in localStorage) {
				if (k.match(/^image#/)) {
					let v = localStorage[k];
					try {
						if (v[0] === '"') {
							v = JSON.parse(v);
						}
						// eslint-disable-next-line no-empty
					} catch (e) { }
					addRow(k, v);
				}
			}
		}

		if (!localStorageAvailable) {
			// @TODO: DRY with similar message
			// @TODO: instructions for your browser; it's called Cookies in chrome/chromium at least, and "storage" gives NO results
			$message.html("<p>Please enable local storage in your browser's settings for local backup. It may be called Cookies, Storage, or Site Data.</p>");
		} else if ($table.find("tr").length == 0) {
			$message.html("<p>All clear!</p>");
		}

		$storage_manager.$content.width(450);
		$storage_manager.center();

		$storage_manager.find(".remove-button").focus();
	}

	exports.storage_quota_exceeded = storage_quota_exceeded;
	exports.manage_storage = manage_storage;

})(window);