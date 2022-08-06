
// retrieves a file via XMLHTTPRequest, calls fncCallback when done or fncError on error.

function XHR(strURL, fncCallback /*, argumentToPass1, argumentToPass2, etc. */) {
	var oHTTP, argsArr = Array.prototype.slice.call(arguments, 2);
	if (window.XMLHttpRequest) { oHTTP = new XMLHttpRequest(); }
	else if (window.ActiveXObject) { oHTTP = new ActiveXObject("Microsoft.XMLHTTP"); }
	if (oHTTP) {
		if (fncCallback) {
			if (typeof(oHTTP.onload) !== "undefined")
				oHTTP.onload = function() {
					fncCallback.apply(oHTTP, argsArr);
					oHTTP = null;
				};
			else {
				oHTTP.onreadystatechange = function() {
					if (oHTTP.readyState === 4) {
						fncCallback.apply(oHTTP, argsArr);
						oHTTP = null;
					}
				};
			}
		}
		oHTTP.open("GET", strURL, true);
  		oHTTP.setRequestHeader("Content-Type", "text/plain");
		oHTTP.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		oHTTP.send(null);
	}
}

function setAttribs() { for (var iAttr = 0; iAttr < arguments.length; iAttr++) { this[arguments[iAttr][0]] = arguments[iAttr][1]; } return(this); }
function setStyles() { for (var iPropr = 0; iPropr < arguments.length; iPropr++) { this.style[arguments[iPropr][0]] = arguments[iPropr][1]; } return(this); }
