((exports) => {

	const TAU =
		//                //////|//////
		//            /////     |     /////
		//         ///         tau         ///
		//       ///     ...--> | <--...     ///
		//     ///     -'   one | turn  '-     ///
		//    //     .'         |         '.     //
		//   //     /           |           \     //
		//  //     |            | <-..       |     //
		//  //    |          .->|     \       |    //
		//  //    |         /   |      |      |    //
		- - - - - - - - Math.PI + Math.PI - - - - - 0;
	//	//  //    |         \   |      |      |    //
	//	//  //    |          '->|     /       |    //
	//	//  //     |            | <-''       |     //
	//	//   //     \           |           /     //
	//	//    //     '.         |         .'     //
	//	//     ///     -.       |       .-     ///
	//	//       ///     '''----|----'''     ///
	//	//         ///          |          ///
	//	//           //////     |     /////
	//	//                //////|//////          C/r;

	const is_pride_month = new Date().getMonth() === 5; // June (0-based, 0 is January)

	const $G = $(window);

	function make_css_cursor(name, coords, fallback) {
		return `url(images/cursors/${name}.png) ${coords.join(" ")}, ${fallback}`;
	}

	function E(t) {
		return document.createElement(t);
	}

	/** Returns a function, that, as long as it continues to be invoked, will not
	be triggered. The function will be called after it stops being called for
	N milliseconds. If `immediate` is passed, trigger the function on the
	leading edge, instead of the trailing. */
	function debounce(func, wait_ms, immediate) {
		let timeout;
		const debounced_func = function () {
			const context = this;
			const args = arguments;

			const later = () => {
				timeout = null;
				if (!immediate) {
					func.apply(context, args);
				}
			};

			const callNow = immediate && !timeout;

			clearTimeout(timeout);

			timeout = setTimeout(later, wait_ms);

			if (callNow) {
				func.apply(context, args);
			}
		};
		debounced_func.cancel = () => {
			clearTimeout(timeout);
		};
		return debounced_func;
	}

	function memoize_synchronous_function(func, max_entries = 50000) {
		const cache = {};
		const keys = [];
		const memoized_func = (...args) => {
			if (args.some((arg) => arg instanceof CanvasPattern)) {
				return func.apply(null, args);
			}
			const key = JSON.stringify(args);
			if (cache[key]) {
				return cache[key];
			} else {
				const val = func.apply(null, args);
				cache[key] = val;
				keys.push(key);
				if (keys.length > max_entries) {
					const oldest_key = keys.shift();
					delete cache[oldest_key];
				}
				return val;
			}
		}
		memoized_func.clear_memo_cache = () => {
			for (const key of keys) {
				delete cache[key];
			}
			keys.length = 0;
		};
		return memoized_func;
	}

	const get_rgba_from_color = memoize_synchronous_function((color) => {
		const single_pixel_canvas = make_canvas(1, 1);

		single_pixel_canvas.ctx.fillStyle = color;
		single_pixel_canvas.ctx.fillRect(0, 0, 1, 1);

		const image_data = single_pixel_canvas.ctx.getImageData(0, 0, 1, 1);

		// We could just return image_data.data, but let's return an Array instead
		// I'm not totally sure image_data.data wouldn't keep the ImageData object around in memory
		return Array.from(image_data.data);
	});

	/**
	 * Compare two ImageData.
	 * Note: putImageData is lossy, due to premultiplied alpha.
	 * @returns {boolean} whether all pixels match within the specified threshold
	*/
	function image_data_match(a, b, threshold) {
		const a_data = a.data;
		const b_data = b.data;
		if (a_data.length !== b_data.length) {
			return false;
		}
		for (let len = a_data.length, i = 0; i < len; i++) {
			if (a_data[i] !== b_data[i]) {
				if (Math.abs(a_data[i] - b_data[i]) > threshold) {
					return false;
				}
			}
		}
		return true;
	}

	function make_canvas(width, height) {
		const image = width;

		const new_canvas = E("canvas");
		const new_ctx = new_canvas.getContext("2d");

		new_canvas.ctx = new_ctx;

		new_ctx.disable_image_smoothing = () => {
			new_ctx.imageSmoothingEnabled = false;
			// condition is to avoid a deprecation warning in Firefox
			if (new_ctx.imageSmoothingEnabled !== false) {
				new_ctx.mozImageSmoothingEnabled = false;
				new_ctx.webkitImageSmoothingEnabled = false;
				new_ctx.msImageSmoothingEnabled = false;
			}
		};
		new_ctx.enable_image_smoothing = () => {
			new_ctx.imageSmoothingEnabled = true;
			if (new_ctx.imageSmoothingEnabled !== true) {
				new_ctx.mozImageSmoothingEnabled = true;
				new_ctx.webkitImageSmoothingEnabled = true;
				new_ctx.msImageSmoothingEnabled = true;
			}
		};

		// @TODO: simplify the abstraction by defining setters for width/height
		// that reset the image smoothing to disabled
		// and make image smoothing a parameter to make_canvas

		new_ctx.copy = image => {
			new_canvas.width = image.naturalWidth || image.width;
			new_canvas.height = image.naturalHeight || image.height;

			// setting width/height resets image smoothing (along with everything)
			new_ctx.disable_image_smoothing();

			if (image instanceof ImageData) {
				new_ctx.putImageData(image, 0, 0);
			} else {
				new_ctx.drawImage(image, 0, 0);
			}
		};

		if (width && height) {
			// make_canvas(width, height)
			new_canvas.width = width;
			new_canvas.height = height;
			// setting width/height resets image smoothing (along with everything)
			new_ctx.disable_image_smoothing();
		} else if (image) {
			// make_canvas(image)
			new_ctx.copy(image);
		}

		return new_canvas;
	}

	function get_help_folder_icon(file_name) {
		const icon_img = new Image();
		icon_img.src = `help/${file_name}`;
		return icon_img;
	}

	function get_icon_for_tool(tool) {
		return get_help_folder_icon(tool.help_icon);
	}

	// not to be confused with load_image_from_uri
	function load_image_simple(src) {
		return new Promise((resolve, reject) => {
			const img = new Image();

			img.onload = () => { resolve(img); };
			img.onerror = () => { reject(new Error(`failed to load image from ${src}`)); };

			img.src = src;
		});
	}

	function get_icon_for_tools(tools) {
		if (tools.length === 1) {
			return get_icon_for_tool(tools[0]);
		}
		const icon_canvas = make_canvas(16, 16);

		Promise.all(tools.map((tool) => load_image_simple(`help/${tool.help_icon}`)))
			.then((icons) => {
				icons.forEach((icon, i) => {
					const w = icon_canvas.width / icons.length;
					const x = i * w;
					const h = icon_canvas.height;
					const y = 0;
					icon_canvas.ctx.drawImage(icon, x, y, w, h, x, y, w, h);
				});
			})
		return icon_canvas;
	}

	/**
	 * Converts an RGB color value to HSL. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and l in the set [0, 1].
	 *
	 * @param   Number  r       The red color value
	 * @param   Number  g       The green color value
	 * @param   Number  b       The blue color value
	 * @return  Array           The HSL representation
	 */
	function rgb_to_hsl(r, g, b) {
		r /= 255; g /= 255; b /= 255;

		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		}

		return [h, s, l];
	}

	exports.TAU = TAU;
	exports.is_pride_month = is_pride_month;
	exports.$G = $G;
	exports.E = E;
	exports.make_css_cursor = make_css_cursor;
	exports.make_canvas = make_canvas;
	exports.get_help_folder_icon = get_help_folder_icon;
	exports.get_icon_for_tool = get_icon_for_tool;
	exports.get_icon_for_tools = get_icon_for_tools;
	exports.load_image_simple = load_image_simple;
	exports.rgb_to_hsl = rgb_to_hsl;
	exports.image_data_match = image_data_match;
	exports.get_rgba_from_color = get_rgba_from_color;
	exports.memoize_synchronous_function = memoize_synchronous_function;
	exports.debounce = debounce;

})(window);