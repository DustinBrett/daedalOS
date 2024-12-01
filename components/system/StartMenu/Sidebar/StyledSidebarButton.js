"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var styled_components_1 = require("styled-components");
var StyledSidebar_1 = require("components/system/StartMenu/Sidebar/StyledSidebar");
var StyledSidebarButton = styled_components_1.default.li(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  border: 1px solid transparent;\n  display: flex;\n  height: ", "px;\n  place-content: center;\n  place-items: center;\n  transition-duration: 150ms;\n  width: ", "px;\n\n  &::before {\n    border-left: ", ";\n    content: \"\";\n    height: ", "px;\n    left: 0;\n    position: absolute;\n    width: ", "px;\n  }\n#startMenu {\n  top: 3vh \n  padding-top: 2px\n}\n  figure {\n    color: ", ";\n    display: flex;\n    place-items: center;\n\n    svg {\n      fill: ", ";\n      height: ", ";\n      left: ", ";\n      margin-left: 1px;\n      pointer-events: none;\n      position: absolute;\n      width: ", ";\n    }\n\n    figcaption {\n      border: 1px solid transparent;\n      left: ", "px;\n      position: absolute;\n      white-space: nowrap;\n\n      strong {\n        font-weight: 600;\n      }\n    }\n  }\n\n  ", ":hover:not(", ".collapsed) & {\n    transition: width 300ms;\n    transition-timing-function: cubic-bezier(0.15, 1, 0.5, 1);\n    width: ", ";\n  }\n\n  &:hover {\n    background-color: hsla(0, 0%, 35%, 70%);\n    border: 1px solid hsla(0, 0%, 45%, 70%);\n  }\n\n  &:active {\n    background-color: hsla(0, 0%, 40%, 70%);\n  }\n"], ["\n  border: 1px solid transparent;\n  display: flex;\n  height: ", "px;\n  place-content: center;\n  place-items: center;\n  transition-duration: 150ms;\n  width: ", "px;\n\n  &::before {\n    border-left: ", ";\n    content: \"\";\n    height: ", "px;\n    left: 0;\n    position: absolute;\n    width: ", "px;\n  }\n#startMenu {\n  top: 3vh \n  padding-top: 2px\n}\n  figure {\n    color: ", ";\n    display: flex;\n    place-items: center;\n\n    svg {\n      fill: ", ";\n      height: ", ";\n      left: ", ";\n      margin-left: 1px;\n      pointer-events: none;\n      position: absolute;\n      width: ", ";\n    }\n\n    figcaption {\n      border: 1px solid transparent;\n      left: ", "px;\n      position: absolute;\n      white-space: nowrap;\n\n      strong {\n        font-weight: 600;\n      }\n    }\n  }\n\n  ", ":hover:not(", ".collapsed) & {\n    transition: width 300ms;\n    transition-timing-function: cubic-bezier(0.15, 1, 0.5, 1);\n    width: ", ";\n  }\n\n  &:hover {\n    background-color: hsla(0, 0%, 35%, 70%);\n    border: 1px solid hsla(0, 0%, 45%, 70%);\n  }\n\n  &:active {\n    background-color: hsla(0, 0%, 40%, 70%);\n  }\n"])), function (_a) {
    var theme = _a.theme;
    return theme.sizes.startMenu.sideBar.buttonHeight;
}, function (_a) {
    var theme = _a.theme;
    return theme.sizes.startMenu.sideBar.width;
}, function (_a) {
    var $active = _a.$active, theme = _a.theme;
    return "4px solid ".concat($active ? theme.colors.selectionHighlight : "transparent");
}, function (_a) {
    var theme = _a.theme;
    return theme.sizes.startMenu.sideBar.buttonHeight;
}, function (_a) {
    var theme = _a.theme;
    return theme.sizes.startMenu.sideBar.width;
}, function (_a) {
    var $active = _a.$active, theme = _a.theme;
    return $active ? theme.colors.highlight : theme.colors.text;
}, function (_a) {
    var $active = _a.$active, theme = _a.theme;
    return $active ? theme.colors.highlight : theme.colors.text;
}, function (_a) {
    var theme = _a.theme;
    return theme.sizes.startMenu.sideBar.iconSize;
}, function (_a) {
    var theme = _a.theme;
    return theme.sizes.startMenu.sideBar.iconSize;
}, function (_a) {
    var theme = _a.theme;
    return theme.sizes.startMenu.sideBar.iconSize;
}, function (_a) {
    var theme = _a.theme;
    return theme.sizes.startMenu.sideBar.width;
}, StyledSidebar_1.default, StyledSidebar_1.default, function (_a) {
    var theme = _a.theme;
    return theme.sizes.startMenu.sideBar.expandedWidth;
});
exports.default = StyledSidebarButton;
var templateObject_1;
