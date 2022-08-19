var Konami = {};

(function() {
	var afterSequence = function(sequence, action) {
		var index = 0;

		return function(event) {
			var matchedKey = event.keyCode === sequence[index];
			// if it didn't match, reset and try matching against the first key
			if (!matchedKey) {
				index = 0;
				matchedKey = event.keyCode === sequence[index];
			}

			if (matchedKey) {
				index += 1;

				// fix for Firefox with "Search for text when you start typing" enabled
				// https://support.mozilla.org/en-US/kb/search-contents-current-page-text-or-links
				// prevent the default (opening Quick Search) for B and A,
				// which are luckily at the end of the Konami Code sequence
				// (otherwise it could prevent typing A and B in text fields unwantedly)
				if (event.keyCode === 66 || event.keyCode === 65) {
					event.preventDefault();
				}

				if (index === sequence.length) {

					// reset when sequence completed
					index = 0;

					// fire action
					action();
				}
			}

		};
	};

	Konami.code = function(action) {
		return afterSequence([38, 38, 40, 40, 37, 39, 37, 39, 66, 65], action);
	};

}());
