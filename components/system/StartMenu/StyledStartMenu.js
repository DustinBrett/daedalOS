"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var styled_components_1 = require("styled-components");
var framer_motion_1 = require("framer-motion");
var StyledFileEntry_1 = require("components/system/Files/Views/List/StyledFileEntry");
var StyledFileManager_1 = require("components/system/Files/Views/List/StyledFileManager");
var TaskbarPanel_1 = require("components/system/Taskbar/TaskbarPanel");
var ScrollBars_1 = require("styles/common/ScrollBars");
var constants_1 = require("utils/constants");
var StyledStartMenu = (0, styled_components_1.default)(framer_motion_1.m.nav)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  ", "\n\n  ", " {\n    ", ";\n   \n    margin-top: 2px;\n    overflow-x: hidden;\n    padding-top: 0px;\n\n    ", " {\n      width: ", ";\n\n      @supports not selector(::-webkit-scrollbar) {\n        width: ", ";\n      }\n    }\n\n    ", " {\n      margin: 0;\n      overflow: hidden;\n      padding: 0;\n      margin-top: 2px\n      scrollbar-gutter: auto;\n\n      figure {\n        picture {\n          margin-left: 11px;\n        }\n\n        &:active {\n          picture {\n            margin-left: 15px;\n          }\n        }\n\n        picture,\n        svg {\n          transition: none;\n        }\n      }\n    }\n\n    @supports not selector(::-webkit-scrollbar) {\n      scrollbar-width: ", ";\n    }\n\n    &::-webkit-scrollbar {\n      width: ", "px;\n    }\n\n    &::-webkit-scrollbar-corner,\n    &::-webkit-scrollbar-track {\n      background-color: ", ";\n    }\n\n    &::-webkit-scrollbar-button:single-button {\n      background-color: ", ";\n      border: ", ";\n    }\n\n    &::-webkit-scrollbar-thumb:vertical {\n      background-color: ", ";\n    }\n  }\n"], ["\n  ", "\n\n  ", " {\n    ", ";\n   \n    margin-top: 2px;\n    overflow-x: hidden;\n    padding-top: 0px;\n\n    ", " {\n      width: ", ";\n\n      @supports not selector(::-webkit-scrollbar) {\n        width: ", ";\n      }\n    }\n\n    ", " {\n      margin: 0;\n      overflow: hidden;\n      padding: 0;\n      margin-top: 2px\n      scrollbar-gutter: auto;\n\n      figure {\n        picture {\n          margin-left: 11px;\n        }\n\n        &:active {\n          picture {\n            margin-left: 15px;\n          }\n        }\n\n        picture,\n        svg {\n          transition: none;\n        }\n      }\n    }\n\n    @supports not selector(::-webkit-scrollbar) {\n      scrollbar-width: ", ";\n    }\n\n    &::-webkit-scrollbar {\n      width: ", "px;\n    }\n\n    &::-webkit-scrollbar-corner,\n    &::-webkit-scrollbar-track {\n      background-color: ", ";\n    }\n\n    &::-webkit-scrollbar-button:single-button {\n      background-color: ", ";\n      border: ", ";\n    }\n\n    &::-webkit-scrollbar-thumb:vertical {\n      background-color: ", ";\n    }\n  }\n"])), function (_a) {
    var theme = _a.theme;
    return (0, TaskbarPanel_1.default)(theme.sizes.startMenu.maxHeight, theme.sizes.startMenu.size);
}, StyledFileManager_1.default, (0, ScrollBars_1.default)(constants_1.THIN_SCROLLBAR_WIDTH, -2, -1), StyledFileEntry_1.default, function (_a) {
    var theme = _a.theme;
    return "".concat(theme.sizes.startMenu.size - theme.sizes.startMenu.sideBar.width - constants_1.THIN_SCROLLBAR_WIDTH, "px");
}, function (_a) {
    var theme = _a.theme;
    return "".concat(theme.sizes.startMenu.size - theme.sizes.startMenu.sideBar.width - constants_1.THIN_SCROLLBAR_WIDTH_NON_WEBKIT, "px");
}, StyledFileManager_1.default, function (_a) {
    var $showScrolling = _a.$showScrolling;
    return $showScrolling ? "thin" : "none";
}, function (_a) {
    var $showScrolling = _a.$showScrolling;
    return $showScrolling ? constants_1.THIN_SCROLLBAR_WIDTH : 0;
}, function (_a) {
    var $showScrolling = _a.$showScrolling;
    return $showScrolling ? undefined : "transparent";
}, function (_a) {
    var $showScrolling = _a.$showScrolling;
    return $showScrolling ? undefined : "transparent";
}, function (_a) {
    var $showScrolling = _a.$showScrolling;
    return $showScrolling ? undefined : "1px solid transparent";
}, function (_a) {
    var $showScrolling = _a.$showScrolling;
    return $showScrolling ? undefined : "rgb(167, 167, 167)";
});
exports.default = StyledStartMenu;
var templateObject_1;
