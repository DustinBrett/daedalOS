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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var test_1 = require("@playwright/test");
var constants_1 = require("e2e/constants");
var functions_1 = require("e2e/functions");
test_1.test.beforeEach(functions_1.captureConsoleLogs);
test_1.test.beforeEach(functions_1.disableWallpaper);
test_1.test.beforeEach(function (_a) {
    var page = _a.page;
    return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_b) {
        return [2 /*return*/, (0, functions_1.loadApp)({ page: page }, { app: "FileExplorer" })];
    }); });
});
test_1.test.beforeEach(functions_1.windowsAreVisible);
test_1.test.beforeEach(functions_1.fileExplorerEntriesAreVisible);
(0, test_1.test)("has address bar", function (_a) {
    var page = _a.page;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, functions_1.fileExplorerAddressBarHasValue)(constants_1.TEST_APP_TITLE, { page: page })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.clickFileExplorerAddressBar)({ page: page }, false, 2)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.fileExplorerAddressBarHasValue)("/", { page: page })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.clickFileExplorerAddressBar)({ page: page }, true)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.contextMenuIsVisible)({ page: page })];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Copy address$/, { page: page })];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.contextMenuIsHidden)({ page: page })];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.fileExplorerAddressBarHasValue)(constants_1.TEST_APP_TITLE, { page: page })];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.typeInFileExplorerAddressBar)("/System", { page: page })];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.pressFileExplorerAddressBarKeys)("Enter", { page: page })];
                case 10:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.fileExplorerAddressBarHasValue)("System", { page: page })];
                case 11:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)("Icons", { page: page })];
                case 12:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
});
(0, test_1.test)("can search", function (_a) {
    var page = _a.page;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, functions_1.clickFileExplorerSearchBox)({ page: page })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.typeInFileExplorerSearchBox)(constants_1.TEST_SEARCH, { page: page })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, test_1.expect)(function () { return (0, functions_1.contextMenuIsVisible)({ page: page }); }).toPass()];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.contextMenuEntryIsVisible)(constants_1.TEST_SEARCH_RESULT, { page: page })];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
});
test_1.test.describe("has files & folders", function () {
    test_1.test.describe("has context menu", function () {
        test_1.test.beforeEach(function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickFileExplorerEntry)(constants_1.TEST_ROOT_FILE, { page: page }, true)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.contextMenuIsVisible)({ page: page })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("has items", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var _i, FILE_MENU_ITEMS_1, label;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.contextMenuHasCount)(constants_1.FILE_MENU_ITEMS.length, { page: page })];
                        case 1:
                            _b.sent();
                            _i = 0, FILE_MENU_ITEMS_1 = constants_1.FILE_MENU_ITEMS;
                            _b.label = 2;
                        case 2:
                            if (!(_i < FILE_MENU_ITEMS_1.length)) return [3 /*break*/, 5];
                            label = FILE_MENU_ITEMS_1[_i];
                            // eslint-disable-next-line no-await-in-loop
                            return [4 /*yield*/, (0, functions_1.contextMenuEntryIsVisible)(label, { page: page })];
                        case 3:
                            // eslint-disable-next-line no-await-in-loop
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can open", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Open$/, { page: page })];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)("".concat(constants_1.TEST_ROOT_FILE_TEXT, " - ").concat(constants_1.TEST_ROOT_FILE_DEFAULT_APP), { page: page })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can open with", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Open with$/, { page: page })];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(constants_1.TEST_ROOT_FILE_ALT_APP, { page: page })];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)("".concat(constants_1.TEST_ROOT_FILE_TEXT, " - ").concat(constants_1.TEST_ROOT_FILE_ALT_APP), { page: page })];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can download", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var downloadPromise, download, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            downloadPromise = page.waitForEvent("download");
                            return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Download$/, { page: page })];
                        case 1:
                            _c.sent();
                            return [4 /*yield*/, downloadPromise];
                        case 2:
                            download = _c.sent();
                            _b = test_1.expect;
                            return [4 /*yield*/, download.path()];
                        case 3:
                            _b.apply(void 0, [_c.sent()]).toBeTruthy();
                            (0, test_1.expect)(download.suggestedFilename()).toMatch(constants_1.TEST_ROOT_FILE);
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can cut", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, width;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Cut$/, { page: page })];
                        case 1:
                            _c.sent();
                            return [4 /*yield*/, page.locator(constants_1.DESKTOP_SELECTOR).boundingBox()];
                        case 2:
                            _b = ((_c.sent()) || {}).width, width = _b === void 0 ? 0 : _b;
                            return [4 /*yield*/, (0, functions_1.clickDesktop)({ page: page }, true, width - 25, 25)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, (0, functions_1.contextMenuIsVisible)({ page: page })];
                        case 4:
                            _c.sent();
                            return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Paste$/, { page: page })];
                        case 5:
                            _c.sent();
                            return [4 /*yield*/, (0, functions_1.desktopEntryIsVisible)(constants_1.TEST_ROOT_FILE, { page: page })];
                        case 6:
                            _c.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsHidden)(constants_1.TEST_ROOT_FILE, { page: page })];
                        case 7:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can copy", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, width;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Copy$/, { page: page })];
                        case 1:
                            _c.sent();
                            return [4 /*yield*/, page.locator(constants_1.DESKTOP_SELECTOR).boundingBox()];
                        case 2:
                            _b = ((_c.sent()) || {}).width, width = _b === void 0 ? 0 : _b;
                            return [4 /*yield*/, (0, functions_1.clickDesktop)({ page: page }, true, width - 25, 25)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, (0, functions_1.contextMenuIsVisible)({ page: page })];
                        case 4:
                            _c.sent();
                            return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Paste$/, { page: page })];
                        case 5:
                            _c.sent();
                            return [4 /*yield*/, (0, functions_1.desktopEntryIsVisible)(constants_1.TEST_ROOT_FILE, { page: page })];
                        case 6:
                            _c.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)(constants_1.TEST_ROOT_FILE, { page: page })];
                        case 7:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can delete file", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Delete$/, { page: page })];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsHidden)(constants_1.TEST_ROOT_FILE, { page: page })];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntriesAreVisible)({ page: page })];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, page.reload()];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.windowsAreVisible)({ page: page })];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntriesAreVisible)({ page: page })];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsHidden)(constants_1.TEST_ROOT_FILE, { page: page })];
                        case 7:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can rename", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var flippedName;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Rename$/, { page: page })];
                        case 1:
                            _b.sent();
                            flippedName = __spreadArray([], (0, path_1.dirname)(constants_1.TEST_ROOT_FILE_TEXT), true).reverse().join("");
                            return [4 /*yield*/, (0, functions_1.fileExplorerRenameEntry)(flippedName, { page: page })];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)("".concat(flippedName).concat((0, path_1.extname)(constants_1.TEST_ROOT_FILE_TEXT)), { page: page })];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can archive", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Add to archive...$/, { page: page })];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)(constants_1.TEST_ROOT_ARCHIVE, { page: page })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can create shortcut", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var shortcutFile;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            shortcutFile = "".concat(constants_1.TEST_ROOT_FILE_TEXT, " - Shortcut");
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsHidden)(shortcutFile, { page: page })];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Create shortcut$/, { page: page })];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)(shortcutFile, { page: page })];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryHasShortcutIcon)(shortcutFile, { page: page })];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, page.reload()];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.windowsAreVisible)({ page: page })];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntriesAreVisible)({ page: page })];
                        case 7:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)(shortcutFile, { page: page })];
                        case 8:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("has properties", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Properties$/, { page: page })];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.appIsOpen)("".concat(constants_1.TEST_ROOT_FILE_TEXT, " Properties"), page)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    (0, test_1.test)("can rename via F2", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            var flippedName;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.clickFileExplorerEntry)(constants_1.TEST_ROOT_FILE, { page: page })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.pressFileExplorerEntryKeys)(constants_1.TEST_ROOT_FILE, "F2", { page: page })];
                    case 2:
                        _b.sent();
                        flippedName = __spreadArray([], (0, path_1.dirname)(constants_1.TEST_ROOT_FILE_TEXT), true).reverse().join("");
                        return [4 /*yield*/, (0, functions_1.fileExplorerRenameEntry)(flippedName, { page: page })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)("".concat(flippedName).concat((0, path_1.extname)(constants_1.TEST_ROOT_FILE_TEXT)), { page: page })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("has status bar", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            var statusBar, entryInfo, selectedInfo, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.clickFileExplorerEntry)(constants_1.TEST_ROOT_FILE, { page: page })];
                    case 1:
                        _d.sent();
                        statusBar = page.locator(constants_1.FILE_EXPLORER_STATUS_BAR_SELECTOR);
                        entryInfo = statusBar.getByLabel(/^Total item count$/);
                        selectedInfo = statusBar.getByLabel(/^Selected item count and size$/);
                        return [4 /*yield*/, (0, test_1.expect)(entryInfo).toContainText(/^\d+ items$/)];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, (0, test_1.expect)(selectedInfo).toContainText(/^1 item selected|\d{3} bytes$/)];
                    case 3:
                        _d.sent();
                        _b = test_1.expect;
                        return [4 /*yield*/, page.locator(constants_1.FILE_EXPLORER_ENTRIES_FOCUSED_SELECTOR).count()];
                    case 4:
                        _b.apply(void 0, [_d.sent()]).toEqual(1);
                        return [4 /*yield*/, page.keyboard.down("Control")];
                    case 5:
                        _d.sent();
                        return [4 /*yield*/, (0, functions_1.clickFileExplorerEntry)(constants_1.TEST_ROOT_FILE_2, { page: page })];
                    case 6:
                        _d.sent();
                        return [4 /*yield*/, (0, test_1.expect)(selectedInfo).toContainText(/^2 items selected|\d{3} KB$/)];
                    case 7:
                        _d.sent();
                        _c = test_1.expect;
                        return [4 /*yield*/, page.locator(constants_1.FILE_EXPLORER_ENTRIES_FOCUSED_SELECTOR).count()];
                    case 8:
                        _c.apply(void 0, [_d.sent()]).toEqual(2);
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("has tooltip", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            var responsePromise, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        responsePromise = page.waitForResponse(constants_1.TEST_ROOT_FILE_TEXT);
                        return [4 /*yield*/, (0, functions_1.clickFileExplorerEntry)(constants_1.TEST_ROOT_FILE, { page: page })];
                    case 1:
                        _c.sent();
                        _b = test_1.expect;
                        return [4 /*yield*/, responsePromise];
                    case 2:
                        _b.apply(void 0, [(_c.sent()).ok()]).toBeTruthy();
                        return [4 /*yield*/, (0, functions_1.fileExplorerEntryHasTooltip)(constants_1.TEST_ROOT_FILE, constants_1.TEST_ROOT_FILE_TOOLTIP, {
                                page: page,
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test_1.test.describe("can open", function () {
        test_1.test.beforeEach(function (_a) {
            var page = _a.page;
            return (0, functions_1.fileExplorerEntryIsVisible)(constants_1.TEST_ROOT_FILE, { page: page });
        });
        (0, test_1.test)("via double click", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickFileExplorerEntry)(constants_1.TEST_ROOT_FILE, { page: page }, false, 2)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)("".concat(constants_1.TEST_ROOT_FILE_TEXT, " - ").concat(constants_1.TEST_ROOT_FILE_DEFAULT_APP), { page: page })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("via enter", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.clickFileExplorerEntry)(constants_1.TEST_ROOT_FILE, { page: page })];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.pressFileExplorerEntryKeys)(constants_1.TEST_ROOT_FILE, "Enter", { page: page })];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)("".concat(constants_1.TEST_ROOT_FILE_TEXT, " - ").concat(constants_1.TEST_ROOT_FILE_DEFAULT_APP), { page: page })];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    (0, test_1.test)("can drop on desktop", function (_a) {
        var browserName = _a.browserName, headless = _a.headless, page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        test_1.test.skip(headless && constants_1.DRAG_HEADLESS_NOT_SUPPORTED_BROWSERS.has(browserName), "no headless drag support");
                        return [4 /*yield*/, (0, functions_1.desktopEntryIsHidden)(constants_1.TEST_ROOT_FILE, { page: page })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)(constants_1.TEST_ROOT_FILE, { page: page })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.dragFileExplorerEntryToDesktop)(constants_1.TEST_ROOT_FILE, { page: page })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsHidden)(constants_1.TEST_ROOT_FILE, { page: page })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.desktopEntryIsVisible)(constants_1.TEST_ROOT_FILE, { page: page })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("can select multiple entries", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b, _c, x, _d, y, _e, _f, height, _g, width;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)(constants_1.TEST_ROOT_FILE, { page: page })];
                    case 1:
                        _h.sent();
                        return [4 /*yield*/, (0, functions_1.windowAnimationIsFinished)({ page: page })];
                    case 2:
                        _h.sent();
                        return [4 /*yield*/, page.locator(constants_1.FILE_EXPLORER_SELECTOR).boundingBox()];
                    case 3:
                        _b = (_h.sent()) || {}, _c = _b.x, x = _c === void 0 ? 0 : _c, _d = _b.y, y = _d === void 0 ? 0 : _d;
                        return [4 /*yield*/, page
                                .locator(constants_1.FILE_EXPLORER_ENTRIES_SELECTOR)
                                .first()
                                .boundingBox()];
                    case 4:
                        _e = (_h.sent()) || {}, _f = _e.height, height = _f === void 0 ? 0 : _f, _g = _e.width, width = _g === void 0 ? 0 : _g;
                        return [4 /*yield*/, (0, functions_1.selectArea)({
                                container: constants_1.FILE_EXPLORER_SELECTION_SELECTOR,
                                page: page,
                                selection: {
                                    height: Math.round(height) * 2,
                                    up: true,
                                    width: Math.round(width),
                                    x: x + constants_1.WINDOW_RESIZE_HANDLE_WIDTH / 2,
                                    y: y +
                                        (constants_1.ROOT_FOLDER_VIEW === "details" ? constants_1.FILE_EXPLORER_COLUMN_HEIGHT : 0),
                                },
                            })];
                    case 5:
                        _h.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page.locator(".focus-within")).toHaveCount(2)];
                    case 6:
                        _h.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("can drop from desktop", function (_a) {
        var browserName = _a.browserName, headless = _a.headless, page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        test_1.test.skip(headless && constants_1.DRAG_HEADLESS_NOT_SUPPORTED_BROWSERS.has(browserName), "no headless drag support");
                        return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsHidden)(constants_1.TEST_DESKTOP_FILE, { page: page })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.desktopEntryIsVisible)(constants_1.TEST_DESKTOP_FILE, { page: page })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.dragDesktopEntryToFileExplorer)(constants_1.TEST_DESKTOP_FILE, { page: page })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.desktopEntryIsHidden)(constants_1.TEST_DESKTOP_FILE, { page: page })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerEntryIsVisible)(constants_1.TEST_DESKTOP_FILE, { page: page })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
(0, test_1.test)("can change page title", function (_a) {
    var page = _a.page;
    return __awaiter(void 0, void 0, void 0, function () {
        var focusedAppPageTitle;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    focusedAppPageTitle = "".concat(constants_1.TEST_APP_TITLE_TEXT, " - ").concat(constants_1.BASE_APP_TITLE);
                    return [4 /*yield*/, (0, functions_1.pageHasTitle)(focusedAppPageTitle, { page: page })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.clickFirstDesktopEntry)({ page: page })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.pageHasTitle)(constants_1.BASE_APP_TITLE, { page: page })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.focusOnWindow)({ page: page })];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.pageHasTitle)(focusedAppPageTitle, { page: page })];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
});
(0, test_1.test)("can change page icon", function (_a) {
    var page = _a.page;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, functions_1.pageHasIcon)(constants_1.TEST_APP_ICON, { page: page })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.clickFirstDesktopEntry)({ page: page })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.pageHasIcon)(constants_1.BASE_APP_FAVICON, { page: page })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.focusOnWindow)({ page: page })];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, (0, functions_1.pageHasIcon)(constants_1.TEST_APP_ICON, { page: page })];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
});
test_1.test.describe("has context menu", function () {
    test_1.test.beforeEach(function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.clickFileExplorer)({ page: page }, true, constants_1.WINDOW_RESIZE_HANDLE_WIDTH / 2, constants_1.ROOT_FOLDER_VIEW === "details" ? constants_1.FILE_EXPLORER_COLUMN_HEIGHT : 0)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.contextMenuIsVisible)({ page: page })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("has items", function (_a) {
        var browserName = _a.browserName, page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            var MENU_ITEMS, shownCount, _i, MENU_ITEMS_1, _b, label, shown;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        MENU_ITEMS = (0, functions_1.filterMenuItems)(constants_1.FOLDER_MENU_ITEMS, browserName);
                        shownCount = MENU_ITEMS.filter(function (_a) {
                            var shown = _a[1];
                            return shown;
                        }).length;
                        return [4 /*yield*/, (0, functions_1.contextMenuHasCount)(shownCount, { page: page })];
                    case 1:
                        _c.sent();
                        _i = 0, MENU_ITEMS_1 = MENU_ITEMS;
                        _c.label = 2;
                    case 2:
                        if (!(_i < MENU_ITEMS_1.length)) return [3 /*break*/, 5];
                        _b = MENU_ITEMS_1[_i], label = _b[0], shown = _b[1];
                        // eslint-disable-next-line no-await-in-loop
                        return [4 /*yield*/, (shown
                                ? (0, functions_1.contextMenuEntryIsVisible)(label, { page: page })
                                : (0, functions_1.contextMenuEntryIsHidden)(label, { page: page }))];
                    case 3:
                        // eslint-disable-next-line no-await-in-loop
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("has properties", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^Properties$/, { page: page })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.appIsOpen)(/^Properties$/, page)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
test_1.test.describe("has navigation", function () {
    test_1.test.beforeEach(function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, (0, test_1.expect)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, functions_1.clickFileExplorerEntry)(/^System$/, { page: page }, false, 2)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)(/^System$/, { page: page })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }).toPass()];
            });
        });
    });
    (0, test_1.test)("can go back & forward", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.fileExplorerEntriesAreVisible)({ page: page })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.typeInFileExplorerAddressBar)("/home", { page: page })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.pressFileExplorerAddressBarKeys)("Enter", { page: page })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)(/^home$/, { page: page })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerNavButtonIsVisible)(/^Back to System$/, { page: page })];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerNavButtonIsVisible)(/^Up to "My PC"$/, { page: page })];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.clickFileExplorerNavButton)(/^Back to System$/, { page: page })];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)(/^System$/, { page: page })];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerNavButtonIsVisible)(/^Back to My PC$/, { page: page })];
                    case 9:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerNavButtonIsVisible)(/^Forward to home$/, { page: page })];
                    case 10:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerNavButtonIsVisible)(/^Up to "My PC"$/, { page: page })];
                    case 11:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("can go up", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.clickFileExplorerEntry)(/^Icons$/, { page: page }, false, 2)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)(/^Icons$/, { page: page })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerNavButtonIsVisible)(/^Back to System$/, { page: page })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerNavButtonIsVisible)(/^Up to "System"$/, { page: page })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.clickFileExplorerNavButton)(/^Up to "System"$/, { page: page })];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)(/^System$/, { page: page })];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerNavButtonIsVisible)(/^Back to Icons$/, { page: page })];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.fileExplorerNavButtonIsVisible)(/^Up to "My PC"$/, { page: page })];
                    case 8:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("has recent locations", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.fileExplorerEntriesAreVisible)({ page: page })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.clickFileExplorerNavButton)(/^Recent locations$/, { page: page })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.contextMenuEntryIsVisible)(/^My PC$/, { page: page })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.contextMenuEntryIsVisible)(/^System$/, { page: page })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.contextMenuHasCount)(2, { page: page })];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.clickContextMenuEntry)(/^My PC$/, { page: page })];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)(/^My PC$/, { page: page })];
                    case 7:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
test_1.test.afterEach(functions_1.didCaptureConsoleLogs);
