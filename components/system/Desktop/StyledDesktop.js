"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var styled_components_1 = require("styled-components");
var StyledDesktop = styled_components_1.default.main(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  background-color: transparent;\n  contain: strict;\n  height: 100vh;\n  inset: 0;\n  overflow: hidden;\n  overscroll-behavior: none;\n  position: fixed;\n  width: 100vw;\n\n  #loading-status {\n    background-color: #fff;\n    border: 1px solid #000;\n    border-radius: 8px;\n    box-shadow: 0 0 50px 1px #000;\n    display: none;\n    font-weight: 600;\n    left: 50%;\n    padding: 12px 15px;\n    position: absolute;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    user-select: none;\n  }\n\n  > canvas {\n    background-color: inherit;\n    height: 100%;\n    left: 0;\n    object-fit: cover;\n    position: absolute;\n    top: 0;\n    width: 100%;\n    z-index: -1;\n  }\n"], ["\n  background-color: transparent;\n  contain: strict;\n  height: 100vh;\n  inset: 0;\n  overflow: hidden;\n  overscroll-behavior: none;\n  position: fixed;\n  width: 100vw;\n\n  #loading-status {\n    background-color: #fff;\n    border: 1px solid #000;\n    border-radius: 8px;\n    box-shadow: 0 0 50px 1px #000;\n    display: none;\n    font-weight: 600;\n    left: 50%;\n    padding: 12px 15px;\n    position: absolute;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    user-select: none;\n  }\n\n  > canvas {\n    background-color: inherit;\n    height: 100%;\n    left: 0;\n    object-fit: cover;\n    position: absolute;\n    top: 0;\n    width: 100%;\n    z-index: -1;\n  }\n"])));
exports.default = StyledDesktop;
var templateObject_1;
