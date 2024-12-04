"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minMaxSize = exports.isWindowOutsideBounds = exports.WINDOW_OFFSCREEN_BUFFER_PX = exports.centerPosition = exports.cascadePosition = void 0;
var rndDefaults_1 = require("components/system/Window/RndWindow/rndDefaults");
var constants_1 = require("utils/constants");
var functions_1 = require("utils/functions");
var cascadePosition = function (id, processes, stackOrder, offset) {
    if (stackOrder === void 0) { stackOrder = []; }
    if (offset === void 0) { offset = 0; }
    var pid = id.split(constants_1.PROCESS_DELIMITER)[0];
    var processPid = "".concat(pid).concat(constants_1.PROCESS_DELIMITER);
    var parentPositionProcess = stackOrder.find(function (stackPid) { return stackPid.startsWith(processPid); }) || "";
    var componentWindow = ((processes === null || processes === void 0 ? void 0 : processes[parentPositionProcess]) || {}).componentWindow;
    var _a = (componentWindow === null || componentWindow === void 0 ? void 0 : componentWindow.getBoundingClientRect()) || {}, _b = _a.x, x = _b === void 0 ? 0 : _b, _c = _a.y, y = _c === void 0 ? 0 : _c, _d = _a.width, width = _d === void 0 ? 0 : _d, _e = _a.height, height = _e === void 0 ? 0 : _e;
    var isOffscreen = x + offset + width > (0, functions_1.viewWidth)() || y + offset + height > (0, functions_1.viewHeight)();
    return !isOffscreen && (x || y)
        ? {
            x: x + offset,
            y: y + offset,
        }
        : undefined;
};
exports.cascadePosition = cascadePosition;
var centerPosition = function (_a) {
    var height = _a.height, width = _a.width;
    var _b = [(0, functions_1.viewHeight)(), (0, functions_1.viewWidth)()], vh = _b[0], vw = _b[1];
    return {
        x: Math.floor(vw / 2 - (0, functions_1.pxToNum)(width) / 2),
        y: Math.floor((vh - constants_1.TASKBAR_HEIGHT) / 2 - (0, functions_1.pxToNum)(height) / 2),
    };
};
exports.centerPosition = centerPosition;
exports.WINDOW_OFFSCREEN_BUFFER_PX = {
    BOTTOM: 15,
    LEFT: 150,
    RIGHT: 50,
    TOP: 5,
};
var isWindowOutsideBounds = function (windowState, bounds, checkOffscreen) {
    if (checkOffscreen === void 0) { checkOffscreen = false; }
    var _a = windowState || {}, position = _a.position, size = _a.size;
    var _b = position || {}, _c = _b.x, x = _c === void 0 ? 0 : _c, _d = _b.y, y = _d === void 0 ? 0 : _d;
    var _e = size || {}, _f = _e.height, height = _f === void 0 ? 0 : _f, _g = _e.width, width = _g === void 0 ? 0 : _g;
    if (checkOffscreen) {
        return (x + exports.WINDOW_OFFSCREEN_BUFFER_PX.RIGHT > bounds.x ||
            x + (0, functions_1.pxToNum)(width) - exports.WINDOW_OFFSCREEN_BUFFER_PX.LEFT < 0 ||
            y + exports.WINDOW_OFFSCREEN_BUFFER_PX.BOTTOM > bounds.y ||
            y + exports.WINDOW_OFFSCREEN_BUFFER_PX.TOP < 0);
    }
    return (x < 0 ||
        y < 0 ||
        x + (0, functions_1.pxToNum)(width) > bounds.x ||
        y + (0, functions_1.pxToNum)(height) > bounds.y);
};
exports.isWindowOutsideBounds = isWindowOutsideBounds;
var minMaxSize = function (size, lockAspectRatio) {
    var desiredHeight = Number(size.height - 50);
    var desiredWidth = Number(size.width);
    var _a = [(0, functions_1.viewHeight)(), (0, functions_1.viewWidth)()], vh = _a[0], vw = _a[1];
    var vhWithoutTaskbar = vh - constants_1.TASKBAR_HEIGHT - 15;
    var height = Math.max(rndDefaults_1.MIN_WINDOW_HEIGHT, Math.min(desiredHeight, vhWithoutTaskbar));
    var width = Math.max(rndDefaults_1.MIN_WINDOW_WIDTH, Math.min(desiredWidth, vw));
    if (!lockAspectRatio)
        return { height: height, width: width };
    var isDesiredHeight = desiredHeight === height;
    var isDesiredWidth = desiredWidth === width;
    if (!isDesiredHeight && !isDesiredWidth) {
        if (desiredHeight > desiredWidth) {
            return {
                height: height,
                width: Math.round(width / (vhWithoutTaskbar / height)),
            };
        }
        return {
            height: Math.round(height / (vw / width)),
            width: width,
        };
    }
    if (!isDesiredHeight) {
        return {
            height: height,
            width: Math.round(width / (desiredHeight / height)),
        };
    }
    if (!isDesiredWidth) {
        return {
            height: Math.round(height / (desiredWidth / width)),
            width: width,
        };
    }
    return { height: height, width: width };
};
exports.minMaxSize = minMaxSize;
