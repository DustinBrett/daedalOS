// Use only ES5 syntax for this script, as it's meant to handle old IE.

// Note that this can't simply be merged with the other onerror handler with a try/catch,
// because showMessageBox is async, and could throw an error before dependencies are met (or if there was an error in the error handling),
// and try doesn't catch errors in async code. It would need to be awaited.
// And making show_error_message return a promise might cause subtle problems due to the pattern of `return show_error_message()`.
var old_onerror = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
	try {
		// Some errors don't give an error object, like "ResizeObserver loop limit exceeded"
		show_error_message(localize("Internal application error."), error || message);
	} catch (e) {
		old_onerror(message, source, lineno, colno, error);
		console.warn("Error in error handler:", e);
	}
};

var old_onunhandledrejection = window.onunhandledrejection;
var restore_new_onunhandledrejection_tid;
var new_onunhandledrejection = function (event) {
	// Just in case show_error_message triggers a new unhandledrejection event,
	// we need to make sure we don't call it again.
	// Test by adding to the top of show_error_message:
	// Promise.reject(new Error("EMIT EMIT EMIT"))
	// Also test:
	// throw new Error("EMIT EMIT EMIT");
	// I want my error handling to be RESILIENT!
	window.onunhandledrejection = old_onunhandledrejection;
	clearTimeout(restore_new_onunhandledrejection_tid);
	restore_new_onunhandledrejection_tid = setTimeout(function () {
		window.onunhandledrejection = new_onunhandledrejection;
	}, 0);

	try {
		show_error_message(localize("Internal application error.") + "\nUnhandled Rejection.", event.reason);
	} catch (e) {
		old_onunhandledrejection(event);
		console.warn("Error in unhandledrejection handler:", e);
	}
};
window.onunhandledrejection = new_onunhandledrejection;

// Show a message for old Internet Explorer.
if (/MSIE \d|Trident.*rv:/.test(navigator.userAgent)) {
	document.write(
		'<style>body { text-align: center; }</style>' +
		'<div className="not-supported">' +
		'	<h1 className="not-supported-header">Internet Explorer is not supported!</h1>' +
		'	<p className="not-supported-details">Try Chrome, Firefox, or Edge.</p>' +
		'</div>'
	);
}
