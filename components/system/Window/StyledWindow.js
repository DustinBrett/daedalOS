"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var framer_motion_1 = require("framer-motion");
var styled_components_1 = require("styled-components");
var StyledWindow = (0, styled_components_1.default)(framer_motion_1.m.section)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  background-color: ", ";\n    border-radius: 5px;\n  box-shadow: ", ";\n  contain: strict;\n  height: 100%;\n  outline: ", ";\n  overflow: hidden;\n  position: absolute;\n  width: 100%;\n\n  header + * {\n    height: ", ";\n  }\n"], ["\n  background-color: ", ";\n    border-radius: 5px;\n  box-shadow: ", ";\n  contain: strict;\n  height: 100%;\n  outline: ", ";\n  overflow: hidden;\n  position: absolute;\n  width: 100%;\n\n  header + * {\n    height: ", ";\n  }\n"])), function (_a) {
    var $backgroundColor = _a.$backgroundColor, theme = _a.theme;
    return $backgroundColor || theme.colors.window.background;
}, function (_a) {
    var $isForeground = _a.$isForeground, theme = _a.theme;
    return $isForeground
        ? theme.colors.window.shadow
        : theme.colors.window.shadowInactive;
}, function (_a) {
    var $isForeground = _a.$isForeground, theme = _a.theme;
    return "".concat(theme.sizes.window.outline, " solid ").concat($isForeground
        ? theme.colors.window.outline
        : theme.colors.window.outlineInactive);
}, function (_a) {
    var theme = _a.theme;
    return "calc(100% - ".concat(theme.sizes.titleBar.height, "px)");
});
exports.default = StyledWindow;
var templateObject_1;
