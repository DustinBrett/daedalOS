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
var test_1 = require("@playwright/test");
var directory_1 = require("contexts/process/directory");
var constants_1 = require("e2e/constants");
var functions_1 = require("e2e/functions");
test_1.test.beforeEach(functions_1.captureConsoleLogs);
test_1.test.beforeEach(functions_1.disableWallpaper);
test_1.test.beforeEach(function (_a) {
    var page = _a.page;
    return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_b) {
        return [2 /*return*/, (0, functions_1.loadApp)({ page: page }, { app: "Terminal" })];
    }); });
});
test_1.test.beforeEach(functions_1.windowsAreVisible);
test_1.test.beforeEach(functions_1.terminalHasRows);
test_1.test.describe("has file system access", function () {
    test_1.test.describe("has current directory", function () {
        (0, test_1.test)("default base", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "".concat(constants_1.TERMINAL_BASE_CD, ">"), 1, true)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "pwd")];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, constants_1.TERMINAL_BASE_CD, 3)];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("can change", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "cd /")];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "/>", 1, true)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    test_1.test.describe("can read", function () {
        test_1.test.describe("file", function () {
            (0, test_1.test)("contents", function (_a) {
                var page = _a.page;
                return __awaiter(void 0, void 0, void 0, function () {
                    var testFile;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                testFile = "".concat(constants_1.TERMINAL_BASE_CD, "/desktop.ini");
                                return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "type ".concat(testFile))];
                            case 1:
                                _b.sent();
                                return [4 /*yield*/, (0, functions_1.terminalFileMatchesPublicFile)({ page: page }, testFile)];
                            case 2:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            });
            (0, test_1.test)("mime type", function (_a) {
                var page = _a.page;
                return __awaiter(void 0, void 0, void 0, function () {
                    var testFile;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                testFile = "sitemap.xml";
                                return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "file /".concat(testFile))];
                            case 1:
                                _b.sent();
                                return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "/".concat(testFile, ": application/xml"))];
                            case 2:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            });
        });
        test_1.test.describe("folder", function () {
            (0, test_1.test)("has base directory", function (_a) {
                var page = _a.page;
                return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_b) {
                    return [2 /*return*/, (0, functions_1.terminalDirectoryMatchesPublicFolder)({ page: page }, constants_1.TERMINAL_BASE_CD)];
                }); });
            });
            (0, test_1.test)("has 'Program Files'", function (_a) {
                var page = _a.page;
                return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_b) {
                    return [2 /*return*/, (0, functions_1.terminalDirectoryMatchesPublicFolder)({ page: page }, "/Program Files")];
                }); });
            });
            (0, test_1.test)("has 'System'", function (_a) {
                var page = _a.page;
                return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_b) {
                    return [2 /*return*/, (0, functions_1.terminalDirectoryMatchesPublicFolder)({ page: page }, "/System")];
                }); });
            });
            (0, test_1.test)("has 'home'", function (_a) {
                var page = _a.page;
                return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_b) {
                    return [2 /*return*/, (0, functions_1.terminalDirectoryMatchesPublicFolder)({ page: page }, "/home")];
                }); });
            });
        });
    });
    test_1.test.describe("can create", function () {
        (0, test_1.test)("file", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var testFileName;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            testFileName = "test.txt";
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "touch ".concat(testFileName))];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ls")];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "0 ".concat(testFileName))];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ls ".concat(testFileName))];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalDoesNotHaveText)({ page: page }, "File Not Found")];
                        case 5:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("folder", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var testFolderName;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            testFolderName = "test_folder";
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "md ".concat(testFolderName))];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ls")];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "<DIR>         ".concat(testFolderName))];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "cd ".concat(testFolderName))];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "".concat(constants_1.TERMINAL_BASE_CD, "/").concat(testFolderName, ">"), 1, true)];
                        case 5:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    test_1.test.describe("can copy", function () {
        (0, test_1.test)("file", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var testFile, newTestFile;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            testFile = constants_1.ROOT_PUBLIC_TEST_FILE;
                            newTestFile = "test.ini";
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ls")];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, testFile)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "copy ".concat(testFile, " ").concat(newTestFile))];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "clear")];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ls")];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, testFile)];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, newTestFile)];
                        case 7:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    test_1.test.describe("can delete", function () {
        (0, test_1.test)("file", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var testFile;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            testFile = constants_1.ROOT_PUBLIC_TEST_FILE;
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ls")];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, testFile)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "del ".concat(testFile))];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "clear")];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ls")];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalDoesNotHaveText)({ page: page }, testFile)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("folder", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var testFolder;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            testFolder = "Music";
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ls")];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, testFolder)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "rd ".concat(testFolder))];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "clear")];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ls")];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalDoesNotHaveText)({ page: page }, testFolder)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    test_1.test.describe("can find", function () {
        (0, test_1.test)("existing file", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "find credit")];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "/CREDITS.md")];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("new file", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                var testFile;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            testFile = "abc123.txt";
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "find ".concat(testFile))];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalDoesNotHaveText)({ page: page }, "/home/arcangelo/".concat(testFile))];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "touch ".concat(testFile))];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "find ".concat(testFile))];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "/home/arcangelo/".concat(testFile))];
                        case 5:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        (0, test_1.test)("folder", function (_a) {
            var page = _a.page;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "find document")];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "/home/arcangelo/Documents", 1, false, true)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
});
test_1.test.describe("has commands", function () {
    (0, test_1.test)("echo & clear", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "echo hi")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "hi", 2)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "clear")];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalDoesNotHaveText)({ page: page }, "hi")];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("color", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "color E3")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "Background: Light Yellow")];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "Foreground: Aqua")];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("exit", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "exit")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.windowIsHidden)({ page: page })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("ipconfig", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "ipconfig")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "IPv4 Address")];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("history", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "history")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "1 history")];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("neofetch", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "neofetch")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "Packages: ".concat(Object.entries(directory_1.default).filter(function (_a) {
                                var dialogProcess = _a[1].dialogProcess;
                                return !dialogProcess;
                            }).length))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("nslookup", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "nslookup dustinbrett.com")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "Server:  cloudflare-dns.com")];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "Address:  1.1.1.1")];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "Name:    dustinbrett.com")];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("pet", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "pet")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.sheepIsVisible)({ page: page })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("shutdown", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            var pageLoaded;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pageLoaded = false;
                        page.once("load", function () {
                            pageLoaded = true;
                        });
                        (0, test_1.expect)(pageLoaded).toBeFalsy();
                        return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "shutdown")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, test_1.expect)(function () { return (0, test_1.expect)(pageLoaded).toBeTruthy(); }).toPass()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("taskkill", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "taskkill Terminal")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.windowIsHidden)({ page: page })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("tasklist", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "tasklist")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "Terminal", -1)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("title", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            var testTitle;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        testTitle = "Testing";
                        return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "title ".concat(testTitle))];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.windowTitlebarTextIsVisible)(testTitle, { page: page })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("time", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "time")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, /The current time is: ([01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{2}/)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("date", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "date")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, /The current date is: \d{4}-\d{2}-\d{2}/)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("uptime", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendToTerminal)({ page: page }, "uptime")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, /Uptime: \d+ second(s)?/)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
test_1.test.describe("has tab completion", function () {
    (0, test_1.test)("can see file/folder list", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendTextToTerminal)({ page: page }, "d")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.sendTabToTerminal)({ page: page })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "Documents")];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, constants_1.ROOT_PUBLIC_TEST_FILE)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("can complete folder name", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendTextToTerminal)({ page: page }, "Vi")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.sendTabToTerminal)({ page: page })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "Videos", 1, true)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, test_1.test)("can complete command name", function (_a) {
        var page = _a.page;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, functions_1.sendTextToTerminal)({ page: page }, "he")];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.sendTabToTerminal)({ page: page })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, functions_1.terminalHasText)({ page: page }, "help", 1, true)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
test_1.test.afterEach(functions_1.didCaptureConsoleLogs);
