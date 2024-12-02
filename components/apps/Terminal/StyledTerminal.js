"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var styled_components_1 = require("styled-components");
var ScrollBars_1 = require("styles/common/ScrollBars");
var StyledTerminal = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  height: 100%;\n  width: 100%;\n\n  .terminal {\n    backdrop-filter: blur(8px);\n    height: 100% !important;\n  }\n\n  .xterm-viewport {\n    ", ";\n    width: 100% !important;\n  \n  }\n\n  .xterm-cursor-underline {\n    border-bottom-color: #f3f3f3 !important;\n    border-bottom-width: 4px !important;\n    font-size: 15px !important;\n  }\n\n  .xterm-cursor-blink {\n    animation-duration: 1.067s !important;\n  }\n"], ["\n  height: 100%;\n  width: 100%;\n\n  .terminal {\n    backdrop-filter: blur(8px);\n    height: 100% !important;\n  }\n\n  .xterm-viewport {\n    ", ";\n    width: 100% !important;\n  \n  }\n\n  .xterm-cursor-underline {\n    border-bottom-color: #f3f3f3 !important;\n    border-bottom-width: 4px !important;\n    font-size: 15px !important;\n  }\n\n  .xterm-cursor-blink {\n    animation-duration: 1.067s !important;\n  }\n"])), (0, ScrollBars_1.default)());
exports.default = StyledTerminal;
var templateObject_1;
