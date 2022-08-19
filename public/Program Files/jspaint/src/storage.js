// @TODO: remove remaining cruft from being compiled from CoffeeScript
// or maybe replace this module with localforage actually
// (but need to address asynchronous concerns if doing that)

((exports) => {
	let localStore = {
		get(key, callback) {
			let i, item, len, obj, keys, keys_obj;
			try {
				if (typeof key === "string") {
					item = localStorage.getItem(key);
					if (item) {
						obj = JSON.parse(item);
					}
				} else {
					obj = {};
					if (Array.isArray(key)) {
						keys = key;
						for (i = 0, len = keys.length; i < len; i++) {
							key = keys[i];
							item = localStorage.getItem(key);
							if (item) {
								obj[key] = JSON.parse(item);
							}
						}
					} else {
						keys_obj = key;
						for (key in keys_obj) {
							let defaultValue = keys_obj[key];
							item = localStorage.getItem(key);
							if (item) {
								obj[key] = JSON.parse(item);
							} else {
								obj[key] = defaultValue;
							}
						}
					}
				}
			} catch (error) {
				callback(error);
				return;
			}
			callback(null, obj);
		},
		set(key, value, callback) {
			let to_set = {};
			if (typeof key === "string") {
				to_set = {
					[key]: value
				};
			} else if (Array.isArray(key)) {
				throw new TypeError("Cannot set an array of keys (to what?)");
			} else {
				to_set = key;
				callback = value;
			}
			for (key in to_set) {
				value = to_set[key];
				try {
					localStorage.setItem(key, JSON.stringify(value));
				} catch (error) {
					error.quotaExceeded = error.code === 22 || error.name === "NS_ERROR_DOM_QUOTA_REACHED" || error.number === -2147024882;
					callback(error);
					return;
				}
			}
			return callback(null);
		}
	};

	exports.storage = localStore;

})(window);
