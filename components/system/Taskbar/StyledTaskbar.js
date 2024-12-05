"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var styled_components_1 = require("styled-components");
var constants_1 = require("utils/constants");
var StyledTaskbar = styled_components_1.default.nav(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n\n  background-color: rgba(0,0,0,0.8);\n  bottom: 0;\n  contain: size layout;\n  height: ", "px;\n  left: 0;\n  position: fixed;\n  right: 0;\n  top: 0vh;\n  width: 100vw;\n  z-index: 100000;\n"], ["\n\n  background-color: rgba(0,0,0,0.8);\n  bottom: 0;\n  contain: size layout;\n  height: ", "px;\n  left: 0;\n  position: fixed;\n  right: 0;\n  top: 0vh;\n  width: 100vw;\n  z-index: 100000;\n"])), constants_1.TASKBAR_HEIGHT);
exports.default = StyledTaskbar;
var templateObject_1;
