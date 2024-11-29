"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOCK_TEXT_HEIGHT_OFFSET = exports.formatLocaleDateTime = void 0;
var DEFAULT_LOCALE = "en";
var dateFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
});
var timeFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "numeric",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
});
var dayFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: "long",
});
var formatLocaleDateTime = function (now) {
    var date = dateFormatter.format(now);
    var day = dayFormatter.format(now);
    var time = timeFormatter.format(now);
    return {
        date: "".concat(date, "\n").concat(day),
        time: time,
    };
};
exports.formatLocaleDateTime = formatLocaleDateTime;
exports.CLOCK_TEXT_HEIGHT_OFFSET = 1;
