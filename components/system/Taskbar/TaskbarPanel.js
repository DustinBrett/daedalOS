"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var styled_components_1 = require("styled-components");
var constants_1 = require("utils/constants");
var TaskbarPanel = function (height, width, left, hasBorder) {
    if (left === void 0) { left = 0; }
    if (hasBorder === void 0) { hasBorder = false; }
    return (0, styled_components_1.css)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  background-color: hsla(0, 0%, 13%, 95%);\n  border: ", ";\n  border-bottom-width: 0;\n  top: 3vh;\n  padding-top: 2px;\n  bottom: ", "px;\n  box-shadow: 3px 0 10px 3px hsla(0, 0%, 10%, 50%);\n  contain: strict;\n  display: flex;\n  height: 100%;\n  left: ", "px;\n  max-height: ", "px;\n  max-width: ", "px;\n  position: absolute;\n  width: calc(100% - ", "px);\n  z-index: 10000;\n\n  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {\n    background-color: hsla(0, 0%, 13%, 70%);\n  }\n"], ["\n  background-color: hsla(0, 0%, 13%, 95%);\n  border: ", ";\n  border-bottom-width: 0;\n  top: 3vh;\n  padding-top: 2px;\n  bottom: ", "px;\n  box-shadow: 3px 0 10px 3px hsla(0, 0%, 10%, 50%);\n  contain: strict;\n  display: flex;\n  height: 100%;\n  left: ", "px;\n  max-height: ", "px;\n  max-width: ", "px;\n  position: absolute;\n  width: calc(100% - ", "px);\n  z-index: 10000;\n\n  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {\n    background-color: hsla(0, 0%, 13%, 70%);\n  }\n"])), hasBorder ? "1px solid hsla(0, 0%, 25%, 75%)" : "none", constants_1.TASKBAR_HEIGHT, left, height, width, left);
};
exports.default = TaskbarPanel;
var templateObject_1;
