/* eslint-disable no-useless-concat */
/* eslint-disable no-alert */

// use only ES5 syntax for this script
// set up basic global error handling, which we can override later
window.onerror = function (msg, url, lineNo, columnNo, error) {
	var string = msg.toLowerCase();
	var substring = "script error";
	if (string.indexOf(substring) > -1) {
		alert('Script Error: See Browser Console for Detail');
	} else {
		// try {
		// 	// try-catch in case of circular references or old browsers without JSON.stringify
		// 	error = JSON.stringify(error);
		// } catch (e) {}
		alert('Internal application error: ' + msg + '\n\n' + 'URL: ' + url + '\n' + 'Line: ' + lineNo + '\n' + 'Column: ' + columnNo);
	}
	return false;
};

window.onunhandledrejection = function (event) {
	alert('Unhandled Rejection: ' + event.reason);
}
