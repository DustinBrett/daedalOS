"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileType = exports.updateInputValueOnReactElement = exports.getResultInfo = void 0;
var path_1 = require("path");
var functions_1 = require("components/system/Files/FileEntry/functions");
var constants_1 = require("utils/constants");
var functions_2 = require("utils/functions");
var getResultInfo = function (fs, url, signal) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, subIcons, icon, _b, pid, infoUrl, isYT, cachedIcon;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!fs)
                    return [2 /*return*/, undefined];
                return [4 /*yield*/, new Promise(function (resolve) {
                        fs.lstat(url, function (err, stats) {
                            var isDirectory = !err && stats ? stats.isDirectory() : false;
                            var extension = (0, functions_2.getExtension)(url);
                            if (extension && !isDirectory) {
                                (0, functions_1.getInfoWithExtension)(fs, url, extension, function (fileInfo) {
                                    return resolve(fileInfo);
                                });
                            }
                            else {
                                (0, functions_1.getInfoWithoutExtension)(fs, fs.getRootFS(), url, isDirectory, false, function (fileInfo) { return resolve(fileInfo); }, false);
                            }
                        });
                    })];
            case 1:
                _a = _c.sent(), subIcons = _a.subIcons, icon = _a.icon, _b = _a.pid, pid = _b === void 0 ? constants_1.TEXT_EDITORS[0] : _b, infoUrl = _a.url;
                if (signal === null || signal === void 0 ? void 0 : signal.aborted)
                    return [2 /*return*/, undefined];
                isYT = (0, functions_2.isYouTubeUrl)(infoUrl);
                return [4 /*yield*/, (0, functions_1.getCachedIconUrl)(fs, (0, path_1.join)(isYT ? constants_1.YT_ICON_CACHE : constants_1.ICON_CACHE, "".concat(isYT ? new URL(infoUrl).pathname.replace("/", "") : infoUrl).concat(constants_1.ICON_CACHE_EXTENSION)))];
            case 2:
                cachedIcon = _c.sent();
                return [2 /*return*/, {
                        icon: cachedIcon || icon,
                        pid: pid,
                        subIcons: (subIcons === null || subIcons === void 0 ? void 0 : subIcons.includes(constants_1.FOLDER_FRONT_ICON)) ? subIcons : [],
                        url: infoUrl || url,
                    }];
        }
    });
}); };
exports.getResultInfo = getResultInfo;
var updateInputValueOnReactElement = function (element, value) {
    var wasEmpty = element.value.length === 0;
    var updateInputValue = function () {
        var _a, _b;
        (_b = (_a = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value")) === null || _a === void 0 ? void 0 : _a.set) === null || _b === void 0 ? void 0 : _b.call(element, value);
        element.dispatchEvent(new Event("input", { bubbles: true }));
    };
    updateInputValue();
    requestAnimationFrame(function () {
        return wasEmpty &&
            value.length === 1 &&
            element.value.length === 2 &&
            // Reset the value if it got doubled
            updateInputValue();
    });
};
exports.updateInputValueOnReactElement = updateInputValueOnReactElement;
var fileType = function (stats, extension, isYTUrl, isAppShortcut, isNostrUrl) {
    return isNostrUrl
        ? "Nostr URI"
        : isAppShortcut
            ? "App"
            : isYTUrl
                ? "YouTube Video"
                : (stats === null || stats === void 0 ? void 0 : stats.isDirectory()) || !extension
                    ? "File folder"
                    : (0, functions_1.getFileType)(extension);
};
exports.fileType = fileType;
