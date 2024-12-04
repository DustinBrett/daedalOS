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
var styled_components_1 = require("styled-components");
var react_1 = require("react");
var js_1 = require("components/apps/Terminal/js");
var color_1 = require("components/apps/Terminal/color");
var config_1 = require("components/apps/Terminal/config");
var functions_1 = require("components/apps/Terminal/functions");
var loadWapm_1 = require("components/apps/Terminal/loadWapm");
var processGit_1 = require("components/apps/Terminal/processGit");
var python_1 = require("components/apps/Terminal/python");
var useTerminal_1 = require("components/apps/Terminal/useTerminal");
var Run_1 = require("components/system/Dialogs/Run");
var extensions_1 = require("components/system/Files/FileEntry/extensions");
var functions_2 = require("components/system/Files/FileEntry/functions");
var fileSystem_1 = require("contexts/fileSystem");
var functions_3 = require("contexts/fileSystem/functions");
var process_1 = require("contexts/process");
var directory_1 = require("contexts/process/directory");
var session_1 = require("contexts/session");
var useProcessesRef_1 = require("hooks/useProcessesRef");
var constants_1 = require("utils/constants");
var ffmpeg_1 = require("utils/ffmpeg");
var functions_4 = require("utils/functions");
var imagemagick_1 = require("utils/imagemagick");
var ipfs_1 = require("utils/ipfs");
var search_1 = require("utils/search");
var sheetjs_1 = require("utils/sheetjs");
var mediainfo_1 = require("utils/mediainfo");
var COMMAND_NOT_SUPPORTED = "The system does not support the command.";
var FILE_NOT_FILE = "The system cannot find the file specified.";
var PATH_NOT_FOUND = "The system cannot find the path specified.";
var SYNTAX_ERROR = "The syntax of the command is incorrect.";
var alias = constants_1.PACKAGE_DATA.alias;
var useCommandInterpreter = function (id, cd, terminal, localEcho) {
    var _a = (0, fileSystem_1.useFileSystem)(), createPath = _a.createPath, deletePath = _a.deletePath, exists = _a.exists, fs = _a.fs, lstat = _a.lstat, mapFs = _a.mapFs, mkdirRecursive = _a.mkdirRecursive, readdir = _a.readdir, readFile = _a.readFile, rename = _a.rename, rootFs = _a.rootFs, stat = _a.stat, updateFolder = _a.updateFolder, writeFile = _a.writeFile;
    var _b = (0, process_1.useProcesses)(), closeWithTransition = _b.closeWithTransition, open = _b.open, changeTitle = _b.title;
    var updateRecentFiles = (0, session_1.useSession)().updateRecentFiles;
    var processesRef = (0, useProcessesRef_1.useProcessesRef)();
    var themeName = (0, styled_components_1.useTheme)().name;
    var getFullPath = (0, react_1.useCallback)(function (file, writePath) { return __awaiter(void 0, void 0, Promise, function () {
        var ipfsData, ipfsFile, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!file)
                        return [2 /*return*/, ""];
                    if (!file.startsWith("ipfs://")) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, ipfs_1.getIpfsResource)(file)];
                case 1:
                    ipfsData = _d.sent();
                    _a = path_1.join;
                    _b = [constants_1.DESKTOP_PATH];
                    _c = createPath;
                    return [4 /*yield*/, (0, ipfs_1.getIpfsFileName)(file, ipfsData)];
                case 2: return [4 /*yield*/, _c.apply(void 0, [_d.sent(), writePath || constants_1.DESKTOP_PATH,
                        ipfsData])];
                case 3:
                    ipfsFile = _a.apply(void 0, _b.concat([_d.sent()]));
                    updateFolder(writePath || constants_1.DESKTOP_PATH, (0, path_1.basename)(ipfsFile));
                    return [2 /*return*/, ipfsFile];
                case 4: return [2 /*return*/, (0, path_1.isAbsolute)(file) ? file : (0, path_1.join)(cd.current, file)];
            }
        });
    }); }, [cd, createPath, updateFolder]);
    var colorOutput = (0, react_1.useRef)([]);
    var updateFile = (0, react_1.useCallback)(function (filePath, isDeleted) {
        if (isDeleted === void 0) { isDeleted = false; }
        var dirPath = (0, path_1.dirname)(filePath);
        if (isDeleted) {
            updateFolder(dirPath, undefined, (0, path_1.basename)(filePath));
        }
        else {
            updateFolder(dirPath, (0, path_1.basename)(filePath));
        }
    }, [updateFolder]);
    var findCommandInSystemPath = (0, react_1.useCallback)(function (baseCommand) { return __awaiter(void 0, void 0, Promise, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readdir(constants_1.SYSTEM_PATH)];
                case 1: return [2 /*return*/, (_a.sent()).find(function (entry) {
                        return [".exe", ".wasm"].includes((0, functions_4.getExtension)(entry)) &&
                            (0, path_1.basename)(entry, (0, path_1.extname)(entry)).toLowerCase() ===
                                baseCommand.toLowerCase();
                    })];
            }
        });
    }); }, [readdir]);
    var commandInterpreter = (0, react_1.useCallback)(function (command, printLn, print, pipedCommand) {
        if (command === void 0) { command = ""; }
        if (printLn === void 0) { printLn = (localEcho === null || localEcho === void 0 ? void 0 : localEcho.println.bind(localEcho)) || console.info; }
        if (print === void 0) { print = (localEcho === null || localEcho === void 0 ? void 0 : localEcho.print.bind(localEcho)) || console.info; }
        if (pipedCommand === void 0) { pipedCommand = ""; }
        return __awaiter(void 0, void 0, Promise, function () {
            var pipeCommands, output_1, stdout_1, _a, _b, baseCommand, commandArgs, lcBaseCommand, _c, file, fullPath, _d, directory, fullPath_1, checkNewPath, lcEntry, r, g, b, _e, _f, bg, fg, _g, bgRgb, bgName, _h, fgRgb, fgName, useAsBg, bgAnsi, fgAnsi, source, destination, fullSourcePath, fullDestinationPath, dirName, _j, _k, _l, _m, _o, commandPath, fullPath, _p, _q, directory, listDir, fullPath, commandPath, fullPath, fileTypeFromBuffer, _r, mime, _s, results, file, format, fullPath, ext, _t, convertOrTranscode, _u, _v, newName, newData, _w, _x, dirName, _y, _z, _0, commandName_1, showAliases, helpCommand, commandName, cid, cloudFlareIpTraceText, _1, ip, isValidIp, processId, processName, directory, fullPath, commandPath, fullPath, _2, _3, _4, mappedFolder, fullPath, _5, source, destination, fullSourcePath, fullDestinationPath, _6, _7, _8, browser, cpu, engine, gpu, hostOS, _9, cols, options_1, userId, terminalFont, _10, _11, quota, _12, usage, labelColor_1, labelText_1, output_2, longestLineLength, maxCols, longestLine, imgPadding_1, domainName, nsLookup, answer, primaryFailed, _13, _14, _15, server, address, host, _16, countSheep, killSheep_1, spawnSheep_1, _17, count_1, _18, duration, maxDuration_1, file, fullSourcePath, code, _19, _20, code, file, fullSourcePath, code, _21, code, file, fullPath, dirName, _22, _23, _24, file, fullSourcePath, _25, wasmName, wasmFile, _26, _27, _28, _29, response, _30, _31, bgAnsi, fgAnsi, file, _32, format, fullPath, ext, _33, workBook, _34, dirName, _35, _36, _37, pid, file, fullPath, openUrl, _38, baseFileExists, _39, fileExtension, _40, extCommand, newCommand, fullFilePath, basePid, baseUrl, _41, systemProgram, newCommand, _42;
            var _43;
            var _44, _45, _46, _47, _48, _49;
            return __generator(this, function (_50) {
                switch (_50.label) {
                    case 0:
                        pipeCommands = command.split("|");
                        if (!pipedCommand && pipeCommands.length > 1) {
                            output_1 = [];
                            stdout_1 = function (line) {
                                output_1.push(line);
                            };
                            return [2 /*return*/, pipeCommands.reduce(function (result, pipeCommand, index) { return __awaiter(void 0, void 0, void 0, function () {
                                    var results, isLastCommand, trimmedPipeCommand;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, result];
                                            case 1:
                                                _a.sent();
                                                results = output_1.join("").replace(/\n$/, "");
                                                isLastCommand = index === pipeCommands.length - 1;
                                                trimmedPipeCommand = pipeCommand.trim();
                                                output_1.length = 0;
                                                return [2 /*return*/, commandInterpreter("".concat(trimmedPipeCommand).concat(results ? " ".concat(results) : ""), isLastCommand ? undefined : function (line) { return stdout_1("".concat(line, "\n")); }, isLastCommand ? undefined : stdout_1, trimmedPipeCommand)];
                                        }
                                    });
                                }); }, Promise.resolve(""))];
                        }
                        _a = (0, functions_1.parseCommand)(command, pipedCommand), _b = _a[0], baseCommand = _b === void 0 ? "" : _b, commandArgs = _a.slice(1);
                        lcBaseCommand = baseCommand.toLowerCase();
                        _50.label = 1;
                    case 1:
                        _50.trys.push([1, 214, , 215]);
                        _c = lcBaseCommand;
                        switch (_c) {
                            case "cat": return [3 /*break*/, 2];
                            case "type": return [3 /*break*/, 2];
                            case "cd": return [3 /*break*/, 13];
                            case "cd/": return [3 /*break*/, 13];
                            case "cd.": return [3 /*break*/, 13];
                            case "cd..": return [3 /*break*/, 13];
                            case "chdir": return [3 /*break*/, 13];
                            case "pwd": return [3 /*break*/, 13];
                            case "color": return [3 /*break*/, 24];
                            case "copy": return [3 /*break*/, 25];
                            case "cp": return [3 /*break*/, 25];
                            case "clear": return [3 /*break*/, 35];
                            case "cls": return [3 /*break*/, 35];
                            case "date": return [3 /*break*/, 36];
                            case "del": return [3 /*break*/, 37];
                            case "erase": return [3 /*break*/, 37];
                            case "rd": return [3 /*break*/, 37];
                            case "rm": return [3 /*break*/, 37];
                            case "rmdir": return [3 /*break*/, 37];
                            case "dir": return [3 /*break*/, 43];
                            case "ls": return [3 /*break*/, 43];
                            case "echo": return [3 /*break*/, 55];
                            case "exit": return [3 /*break*/, 56];
                            case "quit": return [3 /*break*/, 56];
                            case "file": return [3 /*break*/, 57];
                            case "find": return [3 /*break*/, 64];
                            case "search": return [3 /*break*/, 64];
                            case "ffmpeg": return [3 /*break*/, 66];
                            case "imagemagick": return [3 /*break*/, 66];
                            case "git": return [3 /*break*/, 79];
                            case "isogit": return [3 /*break*/, 79];
                            case "help": return [3 /*break*/, 82];
                            case "history": return [3 /*break*/, 83];
                            case "ipfs": return [3 /*break*/, 84];
                            case "ifconfig": return [3 /*break*/, 87];
                            case "ipconfig": return [3 /*break*/, 87];
                            case "whatsmyip": return [3 /*break*/, 87];
                            case "kill": return [3 /*break*/, 90];
                            case "taskkill": return [3 /*break*/, 90];
                            case "license": return [3 /*break*/, 91];
                            case "md": return [3 /*break*/, 92];
                            case "mkdir": return [3 /*break*/, 92];
                            case "mediainfo": return [3 /*break*/, 96];
                            case "mount": return [3 /*break*/, 104];
                            case "move": return [3 /*break*/, 111];
                            case "mv": return [3 /*break*/, 111];
                            case "ren": return [3 /*break*/, 111];
                            case "rename": return [3 /*break*/, 111];
                            case "neofetch": return [3 /*break*/, 124];
                            case "systeminfo": return [3 /*break*/, 124];
                            case "nslookup": return [3 /*break*/, 127];
                            case "pet": return [3 /*break*/, 137];
                            case "esheep": return [3 /*break*/, 137];
                            case "ps": return [3 /*break*/, 142];
                            case "tasklist": return [3 /*break*/, 142];
                            case "py": return [3 /*break*/, 143];
                            case "python": return [3 /*break*/, 143];
                            case "python3": return [3 /*break*/, 143];
                            case "qjs": return [3 /*break*/, 152];
                            case "quickjs": return [3 /*break*/, 152];
                            case "node": return [3 /*break*/, 152];
                            case "logout": return [3 /*break*/, 161];
                            case "restart": return [3 /*break*/, 161];
                            case "shutdown": return [3 /*break*/, 161];
                            case "time": return [3 /*break*/, 162];
                            case "title": return [3 /*break*/, 163];
                            case "touch": return [3 /*break*/, 164];
                            case "uptime": return [3 /*break*/, 168];
                            case "ver": return [3 /*break*/, 169];
                            case "version": return [3 /*break*/, 169];
                            case "wapm": return [3 /*break*/, 170];
                            case "wasmer": return [3 /*break*/, 170];
                            case "wax": return [3 /*break*/, 170];
                            case "weather": return [3 /*break*/, 178];
                            case "wttr": return [3 /*break*/, 178];
                            case "whoami": return [3 /*break*/, 181];
                            case "wsl": return [3 /*break*/, 182];
                            case "linux": return [3 /*break*/, 182];
                            case "xlsx": return [3 /*break*/, 183];
                        }
                        return [3 /*break*/, 195];
                    case 2:
                        file = commandArgs[0];
                        if (!file) return [3 /*break*/, 11];
                        return [4 /*yield*/, getFullPath(file)];
                    case 3:
                        fullPath = _50.sent();
                        return [4 /*yield*/, exists(fullPath)];
                    case 4:
                        if (!_50.sent()) return [3 /*break*/, 9];
                        return [4 /*yield*/, lstat(fullPath)];
                    case 5:
                        if (!(_50.sent()).isDirectory()) return [3 /*break*/, 6];
                        printLn("Access is denied.");
                        return [3 /*break*/, 8];
                    case 6:
                        _d = printLn;
                        return [4 /*yield*/, readFile(fullPath)];
                    case 7:
                        _d.apply(void 0, [(_50.sent()).toString()]);
                        _50.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        printLn(PATH_NOT_FOUND);
                        _50.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        printLn(SYNTAX_ERROR);
                        _50.label = 12;
                    case 12: return [3 /*break*/, 213];
                    case 13:
                        directory = (lcBaseCommand.startsWith("cd") && lcBaseCommand.length > 2
                            ? [lcBaseCommand.slice(2)]
                            : commandArgs)[0];
                        if (!(directory && lcBaseCommand !== "pwd")) return [3 /*break*/, 22];
                        return [4 /*yield*/, getFullPath(directory)];
                    case 14:
                        fullPath_1 = _50.sent();
                        checkNewPath = function (newPath) { return __awaiter(void 0, void 0, Promise, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, lstat(newPath)];
                                    case 1:
                                        if (!(_a.sent()).isDirectory()) {
                                            printLn("The directory name is invalid.");
                                        }
                                        else if (cd.current !== newPath) {
                                            // eslint-disable-next-line no-param-reassign
                                            cd.current = newPath;
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, exists(fullPath_1)];
                    case 15:
                        if (!_50.sent()) return [3 /*break*/, 17];
                        return [4 /*yield*/, checkNewPath(fullPath_1)];
                    case 16:
                        _50.sent();
                        return [3 /*break*/, 21];
                    case 17: return [4 /*yield*/, readdir(cd.current)];
                    case 18:
                        lcEntry = (_50.sent()).find(function (entry) {
                            return entry.toLowerCase() === (0, path_1.basename)(fullPath_1).toLowerCase();
                        });
                        if (!lcEntry) return [3 /*break*/, 20];
                        return [4 /*yield*/, checkNewPath((0, path_1.join)(cd.current, lcEntry))];
                    case 19:
                        _50.sent();
                        return [3 /*break*/, 21];
                    case 20:
                        printLn(PATH_NOT_FOUND);
                        _50.label = 21;
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        printLn(cd.current);
                        _50.label = 23;
                    case 23: return [3 /*break*/, 213];
                    case 24:
                        {
                            r = commandArgs[0], g = commandArgs[1], b = commandArgs[2];
                            if (typeof r === "string" &&
                                typeof g === "string" &&
                                typeof b === "string") {
                                print((0, color_1.rgbAnsi)(Number(r), Number(g), Number(b)));
                            }
                            else {
                                _e = commandArgs[0], _f = _e === void 0 ? [] : _e, bg = _f[0], fg = _f[1];
                                _g = color_1.colorAttributes[bg === null || bg === void 0 ? void 0 : bg.toUpperCase()] || {}, bgRgb = _g.rgb, bgName = _g.name;
                                _h = color_1.colorAttributes[fg === null || fg === void 0 ? void 0 : fg.toUpperCase()] || {}, fgRgb = _h.rgb, fgName = _h.name;
                                if (bgRgb) {
                                    useAsBg = Boolean(fgRgb);
                                    bgAnsi = color_1.rgbAnsi.apply(void 0, __spreadArray(__spreadArray([], bgRgb, false), [useAsBg], false));
                                    print(bgAnsi);
                                    printLn("".concat(useAsBg ? "Background" : "Foreground", ": ").concat(bgName));
                                    colorOutput.current[0] = bgAnsi;
                                }
                                if (fgRgb) {
                                    fgAnsi = color_1.rgbAnsi.apply(void 0, fgRgb);
                                    print(fgAnsi);
                                    printLn("Foreground: ".concat(fgName));
                                    colorOutput.current[1] = fgAnsi;
                                }
                                if (!fgRgb && !bgRgb) {
                                    print("\u001B[0m");
                                    colorOutput.current = [];
                                }
                            }
                            return [3 /*break*/, 213];
                        }
                        _50.label = 25;
                    case 25:
                        source = commandArgs[0], destination = commandArgs[1];
                        return [4 /*yield*/, getFullPath(source)];
                    case 26:
                        fullSourcePath = _50.sent();
                        return [4 /*yield*/, exists(fullSourcePath)];
                    case 27:
                        if (!_50.sent()) return [3 /*break*/, 33];
                        if (!destination) return [3 /*break*/, 31];
                        return [4 /*yield*/, getFullPath(destination)];
                    case 28:
                        fullDestinationPath = _50.sent();
                        dirName = (0, path_1.dirname)(fullDestinationPath);
                        _j = updateFile;
                        _k = path_1.join;
                        _l = [dirName];
                        _m = createPath;
                        _o = [(0, path_1.basename)(fullDestinationPath),
                            dirName];
                        return [4 /*yield*/, readFile(fullSourcePath)];
                    case 29: return [4 /*yield*/, _m.apply(void 0, _o.concat([_50.sent()]))];
                    case 30:
                        _j.apply(void 0, [_k.apply(void 0, _l.concat([_50.sent()]))]);
                        printLn("\t1 file(s) copied.");
                        return [3 /*break*/, 32];
                    case 31:
                        printLn("The file cannot be copied onto itself.");
                        printLn("\t0 file(s) copied.");
                        _50.label = 32;
                    case 32: return [3 /*break*/, 34];
                    case 33:
                        printLn(FILE_NOT_FILE);
                        _50.label = 34;
                    case 34: return [3 /*break*/, 213];
                    case 35:
                        terminal === null || terminal === void 0 ? void 0 : terminal.reset();
                        terminal === null || terminal === void 0 ? void 0 : terminal.write("\u001Bc".concat(colorOutput.current.join("")));
                        return [3 /*break*/, 213];
                    case 36:
                        printLn("The current date is: ".concat((0, functions_4.getTZOffsetISOString)().slice(0, 10)));
                        return [3 /*break*/, 213];
                    case 37:
                        commandPath = commandArgs[0];
                        if (!commandPath) return [3 /*break*/, 42];
                        return [4 /*yield*/, getFullPath(commandPath)];
                    case 38:
                        fullPath = _50.sent();
                        return [4 /*yield*/, exists(fullPath)];
                    case 39:
                        _p = (_50.sent());
                        if (!_p) return [3 /*break*/, 41];
                        return [4 /*yield*/, deletePath(fullPath)];
                    case 40:
                        _p = (_50.sent());
                        _50.label = 41;
                    case 41:
                        if (_p) {
                            updateFile(fullPath, true);
                        }
                        _50.label = 42;
                    case 42: return [3 /*break*/, 213];
                    case 43:
                        _q = commandArgs[0], directory = _q === void 0 ? "" : _q;
                        listDir = function (dirPath) { return __awaiter(void 0, void 0, Promise, function () {
                            var totalSize, fileCount, directoryCount, entries, entriesWithStats, totals;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        totalSize = 0;
                                        fileCount = 0;
                                        directoryCount = 0;
                                        return [4 /*yield*/, readdir(dirPath)];
                                    case 1:
                                        entries = _b.sent();
                                        if (!(entries.length === 0 &&
                                            ((_a = rootFs === null || rootFs === void 0 ? void 0 : rootFs.mntMap[dirPath]) === null || _a === void 0 ? void 0 : _a.getName()) === "FileSystemAccess")) return [3 /*break*/, 4];
                                        return [4 /*yield*/, (0, functions_3.requestPermission)(dirPath)];
                                    case 2:
                                        _b.sent();
                                        return [4 /*yield*/, readdir(dirPath)];
                                    case 3:
                                        entries = _b.sent();
                                        _b.label = 4;
                                    case 4: return [4 /*yield*/, Promise.all(entries.map(function (entry) { return __awaiter(void 0, void 0, void 0, function () {
                                            var filePath, fileStats, mDate, date, time, isDirectory, fileMode, permissions, owner, group;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        filePath = (0, path_1.join)(dirPath, entry);
                                                        return [4 /*yield*/, stat(filePath)];
                                                    case 1:
                                                        fileStats = _a.sent();
                                                        mDate = new Date((0, functions_2.getModifiedTime)(filePath, fileStats));
                                                        date = mDate.toISOString().slice(0, 10);
                                                        time = mDate.toISOString().slice(11, 16);
                                                        isDirectory = fileStats.isDirectory();
                                                        fileMode = isDirectory
                                                            ? "d"
                                                            : "-";
                                                        permissions = [
                                                            fileStats.mode & 256 ? "r" : "-",
                                                            fileStats.mode & 128 ? "w" : "-",
                                                            fileStats.mode & 64 ? "x" : "-",
                                                            fileStats.mode & 32 ? "r" : "-",
                                                            fileStats.mode & 16 ? "w" : "-",
                                                            fileStats.mode & 8 ? "x" : "-",
                                                            fileStats.mode & 4 ? "r" : "-",
                                                            fileStats.mode & 2 ? "w" : "-",
                                                            fileStats.mode & 1 ? "x" : "-",
                                                        ].join("");
                                                        owner = "root";
                                                        group = "root";
                                                        totalSize += isDirectory ? 0 : fileStats.size;
                                                        if (isDirectory) {
                                                            directoryCount += 1;
                                                        }
                                                        else {
                                                            fileCount += 1;
                                                        }
                                                        return [2 /*return*/, [
                                                                "".concat(fileMode).concat(permissions),
                                                                "".concat(owner, " ").concat(group),
                                                                fileStats.size.toLocaleString(),
                                                                "".concat(date, " ").concat(time),
                                                                entry, // File or directory name
                                                            ]];
                                                }
                                            });
                                        }); }))];
                                    case 5:
                                        entriesWithStats = _b.sent();
                                        totals = fileCount + directoryCount;
                                        printLn("total ".concat(totals));
                                        printLn("");
                                        (0, functions_1.printTable)([
                                            ["Permissions", 11],
                                            ["Owner/Group", 13],
                                            ["Name", (terminal === null || terminal === void 0 ? void 0 : terminal.cols) ? terminal.cols - 50 : 30],
                                        ], entriesWithStats, printLn, true);
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        if (!(directory &&
                            !directory.startsWith("*") &&
                            !directory.endsWith("*"))) return [3 /*break*/, 52];
                        return [4 /*yield*/, getFullPath(directory)];
                    case 44:
                        fullPath = _50.sent();
                        return [4 /*yield*/, exists(fullPath)];
                    case 45:
                        if (!_50.sent()) return [3 /*break*/, 50];
                        return [4 /*yield*/, lstat(fullPath)];
                    case 46:
                        if (!(_50.sent()).isDirectory()) return [3 /*break*/, 48];
                        return [4 /*yield*/, listDir(fullPath)];
                    case 47:
                        _50.sent();
                        return [3 /*break*/, 49];
                    case 48:
                        printLn((0, path_1.basename)(fullPath));
                        _50.label = 49;
                    case 49: return [3 /*break*/, 51];
                    case 50:
                        printLn("File Not Found");
                        _50.label = 51;
                    case 51: return [3 /*break*/, 54];
                    case 52: return [4 /*yield*/, listDir(cd.current)];
                    case 53:
                        _50.sent();
                        _50.label = 54;
                    case 54: return [3 /*break*/, 213];
                    case 55:
                        printLn(command.slice(command.indexOf(" ") + 1));
                        return [3 /*break*/, 213];
                    case 56:
                        closeWithTransition(id);
                        return [3 /*break*/, 213];
                    case 57:
                        commandPath = commandArgs[0];
                        if (!commandPath) return [3 /*break*/, 63];
                        return [4 /*yield*/, getFullPath(commandPath)];
                    case 58:
                        fullPath = _50.sent();
                        return [4 /*yield*/, exists(fullPath)];
                    case 59:
                        if (!_50.sent()) return [3 /*break*/, 63];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("file-type"); })];
                    case 60:
                        fileTypeFromBuffer = (_50.sent()).fileTypeFromBuffer;
                        _s = fileTypeFromBuffer;
                        return [4 /*yield*/, readFile(fullPath)];
                    case 61: return [4 /*yield*/, _s.apply(void 0, [_50.sent()])];
                    case 62:
                        _r = ((_50.sent()) || {}).mime, mime = _r === void 0 ? "Unknown" : _r;
                        printLn("".concat(commandPath, ": ").concat(mime));
                        _50.label = 63;
                    case 63: return [3 /*break*/, 213];
                    case 64:
                        if (commandArgs.length === 0) {
                            printLn("FIND: Parameter format not correct");
                            return [3 /*break*/, 213];
                        }
                        return [4 /*yield*/, (0, search_1.fullSearch)(commandArgs.join(" "), readFile, rootFs)];
                    case 65:
                        results = _50.sent();
                        results === null || results === void 0 ? void 0 : results.forEach(function (_a) {
                            var ref = _a.ref;
                            return printLn(ref);
                        });
                        return [3 /*break*/, 213];
                    case 66:
                        file = commandArgs[0], format = commandArgs[1];
                        if (!(file && format)) return [3 /*break*/, 77];
                        return [4 /*yield*/, getFullPath(file)];
                    case 67:
                        fullPath = _50.sent();
                        ext = (0, functions_1.formatToExtension)(format);
                        return [4 /*yield*/, exists(fullPath)];
                    case 68:
                        _t = (_50.sent());
                        if (!_t) return [3 /*break*/, 70];
                        return [4 /*yield*/, lstat(fullPath)];
                    case 69:
                        _t = !(_50.sent()).isDirectory();
                        _50.label = 70;
                    case 70:
                        if (!_t) return [3 /*break*/, 75];
                        convertOrTranscode = lcBaseCommand === "ffmpeg" ? ffmpeg_1.transcode : imagemagick_1.convert;
                        _w = convertOrTranscode;
                        _x = [(0, path_1.basename)(fullPath)];
                        return [4 /*yield*/, readFile(fullPath)];
                    case 71: return [4 /*yield*/, _w.apply(void 0, [[_x.concat([_50.sent()])], ext,
                            printLn])];
                    case 72:
                        _u = (_50.sent())[0], _v = _u === void 0 ? [] : _u, newName = _v[0], newData = _v[1];
                        if (!(newName && newData)) return [3 /*break*/, 74];
                        dirName = (0, path_1.dirname)(fullPath);
                        _y = updateFile;
                        _z = path_1.join;
                        _0 = [dirName];
                        return [4 /*yield*/, createPath(newName, dirName, newData)];
                    case 73:
                        _y.apply(void 0, [_z.apply(void 0, _0.concat([_50.sent()]))]);
                        _50.label = 74;
                    case 74: return [3 /*break*/, 76];
                    case 75:
                        printLn(FILE_NOT_FILE);
                        _50.label = 76;
                    case 76: return [3 /*break*/, 78];
                    case 77:
                        printLn(SYNTAX_ERROR);
                        _50.label = 78;
                    case 78: return [3 /*break*/, 213];
                    case 79:
                        if (!fs) return [3 /*break*/, 81];
                        return [4 /*yield*/, (0, processGit_1.default)(commandArgs, cd.current, printLn, fs, updateFolder)];
                    case 80:
                        _50.sent();
                        _50.label = 81;
                    case 81: return [3 /*break*/, 213];
                    case 82:
                        {
                            commandName_1 = commandArgs[0];
                            showAliases = commandName_1 === "-a";
                            if (commandName_1 && !showAliases) {
                                helpCommand = functions_1.commands[commandName_1]
                                    ? commandName_1
                                    : (_44 = Object.entries(functions_1.aliases).find(function (_a) {
                                        var baseCommandName = _a[1][0];
                                        return baseCommandName === commandName_1;
                                    })) === null || _44 === void 0 ? void 0 : _44[0];
                                if (helpCommand && functions_1.commands[helpCommand]) {
                                    printLn(functions_1.commands[helpCommand]);
                                }
                                else {
                                    printLn("This command is not supported by the help utility.");
                                }
                            }
                            else {
                                (0, functions_1.help)(printLn, functions_1.commands, showAliases ? functions_1.aliases : undefined);
                            }
                            return [3 /*break*/, 213];
                        }
                        _50.label = 83;
                    case 83:
                        localEcho === null || localEcho === void 0 ? void 0 : localEcho.history.entries.forEach(function (entry, index) {
                            return printLn("".concat((index + 1).toString().padStart(4), " ").concat(entry));
                        });
                        return [3 /*break*/, 213];
                    case 84:
                        commandName = commandArgs[0], cid = commandArgs[1];
                        if (!(commandName === "get" && cid)) return [3 /*break*/, 86];
                        return [4 /*yield*/, getFullPath("ipfs://".concat(cid), cd.current)];
                    case 85:
                        _50.sent();
                        _50.label = 86;
                    case 86: return [3 /*break*/, 213];
                    case 87: return [4 /*yield*/, fetch("https://cloudflare.com/cdn-cgi/trace")];
                    case 88: return [4 /*yield*/, (_50.sent()).text()];
                    case 89:
                        cloudFlareIpTraceText = (_50.sent()) || "";
                        _1 = Object.fromEntries(cloudFlareIpTraceText
                            .trim()
                            .split("\n")
                            .map(function (entry) { return entry.split("="); }) || []).ip, ip = _1 === void 0 ? "" : _1;
                        isValidIp = function (possibleIp) {
                            var octets = possibleIp.split(".");
                            return (octets.length === 4 &&
                                octets.map(Number).every(function (octet) { return octet > 0 && octet < 256; }));
                        };
                        printLn("IP Configuration");
                        printLn("");
                        printLn("   IPv4 Address. . . . . . . . . . . : ".concat(isValidIp(ip) ? ip : "Unknown"));
                        return [3 /*break*/, 213];
                    case 90:
                        {
                            processId = commandArgs[0];
                            processName = Number.isNaN(processId) || processesRef.current[processId]
                                ? processId
                                : Object.keys(processesRef.current)[Number(processId)];
                            if (processesRef.current[processName]) {
                                closeWithTransition(processName);
                                printLn("SUCCESS: Sent termination signal to the process \"".concat(processName, "\"."));
                            }
                            else {
                                printLn("ERROR: The process \"".concat(processName, "\" not found."));
                            }
                            return [3 /*break*/, 213];
                        }
                        _50.label = 91;
                    case 91:
                        printLn(useTerminal_1.displayLicense);
                        return [3 /*break*/, 213];
                    case 92:
                        directory = commandArgs[0];
                        if (!directory) return [3 /*break*/, 95];
                        return [4 /*yield*/, getFullPath(directory)];
                    case 93:
                        fullPath = _50.sent();
                        return [4 /*yield*/, mkdirRecursive(fullPath)];
                    case 94:
                        _50.sent();
                        updateFile(fullPath);
                        _50.label = 95;
                    case 95: return [3 /*break*/, 213];
                    case 96:
                        commandPath = commandArgs[0];
                        if (!commandPath) return [3 /*break*/, 103];
                        return [4 /*yield*/, getFullPath(commandPath)];
                    case 97:
                        fullPath = _50.sent();
                        return [4 /*yield*/, exists(fullPath)];
                    case 98:
                        if (!_50.sent()) return [3 /*break*/, 103];
                        _50.label = 99;
                    case 99:
                        _50.trys.push([99, 102, , 103]);
                        _2 = printLn;
                        _3 = mediainfo_1.analyzeFileToText;
                        return [4 /*yield*/, readFile(fullPath)];
                    case 100: return [4 /*yield*/, _3.apply(void 0, [_50.sent()])];
                    case 101:
                        _2.apply(void 0, [_50.sent()]);
                        return [3 /*break*/, 103];
                    case 102:
                        _4 = _50.sent();
                        printLn("Failed to parse media file");
                        return [3 /*break*/, 103];
                    case 103: return [3 /*break*/, 213];
                    case 104:
                        if (!(0, functions_4.isFileSystemMappingSupported)()) return [3 /*break*/, 109];
                        _50.label = 105;
                    case 105:
                        _50.trys.push([105, 107, , 108]);
                        return [4 /*yield*/, mapFs(cd.current)];
                    case 106:
                        mappedFolder = _50.sent();
                        if (mappedFolder) {
                            fullPath = (0, path_1.join)(cd.current, mappedFolder);
                            updateFolder(cd.current, mappedFolder);
                            // eslint-disable-next-line no-param-reassign
                            cd.current = fullPath;
                        }
                        return [3 /*break*/, 108];
                    case 107:
                        _5 = _50.sent();
                        return [3 /*break*/, 108];
                    case 108: return [3 /*break*/, 110];
                    case 109:
                        printLn(COMMAND_NOT_SUPPORTED);
                        _50.label = 110;
                    case 110: return [3 /*break*/, 213];
                    case 111:
                        source = commandArgs[0], destination = commandArgs[1];
                        return [4 /*yield*/, getFullPath(source)];
                    case 112:
                        fullSourcePath = _50.sent();
                        return [4 /*yield*/, exists(fullSourcePath)];
                    case 113:
                        if (!_50.sent()) return [3 /*break*/, 122];
                        if (!destination) return [3 /*break*/, 120];
                        return [4 /*yield*/, getFullPath(destination)];
                    case 114:
                        fullDestinationPath = _50.sent();
                        _7 = ["move", "mv"].includes(lcBaseCommand);
                        if (!_7) return [3 /*break*/, 116];
                        return [4 /*yield*/, exists(fullDestinationPath)];
                    case 115:
                        _7 = (_50.sent());
                        _50.label = 116;
                    case 116:
                        _6 = _7;
                        if (!_6) return [3 /*break*/, 118];
                        return [4 /*yield*/, lstat(fullDestinationPath)];
                    case 117:
                        _6 = (_50.sent()).isDirectory();
                        _50.label = 118;
                    case 118:
                        if (_6) {
                            fullDestinationPath = (0, path_1.join)(fullDestinationPath, (0, path_1.basename)(fullSourcePath));
                        }
                        return [4 /*yield*/, rename(fullSourcePath, fullDestinationPath)];
                    case 119:
                        if (_50.sent()) {
                            updateFile(fullSourcePath, true);
                            updateFile(fullDestinationPath);
                        }
                        return [3 /*break*/, 121];
                    case 120:
                        printLn(SYNTAX_ERROR);
                        _50.label = 121;
                    case 121: return [3 /*break*/, 123];
                    case 122:
                        printLn(FILE_NOT_FILE);
                        _50.label = 123;
                    case 123: return [3 /*break*/, 213];
                    case 124: return [4 /*yield*/, (0, functions_4.loadFiles)(["/Program Files/Xterm.js/ua-parser.js"])];
                    case 125:
                        _50.sent();
                        _8 = (new window.UAParser().getResult() || {}), browser = _8.browser, cpu = _8.cpu, engine = _8.engine, gpu = _8.gpu, hostOS = _8.os;
                        _9 = terminal || {}, cols = _9.cols, options_1 = _9.options;
                        userId = "public@".concat(window.location.hostname);
                        terminalFont = (_45 = ((options_1 === null || options_1 === void 0 ? void 0 : options_1.fontFamily) || config_1.config.fontFamily)) === null || _45 === void 0 ? void 0 : _45.split(", ").find(function (font) {
                            return document.fonts.check("".concat((options_1 === null || options_1 === void 0 ? void 0 : options_1.fontSize) || config_1.config.fontSize || 12, "px ").concat(font));
                        });
                        return [4 /*yield*/, ((_47 = (_46 = navigator.storage) === null || _46 === void 0 ? void 0 : _46.estimate) === null || _47 === void 0 ? void 0 : _47.call(_46))];
                    case 126:
                        _10 = (_50.sent()) || {}, _11 = _10.quota, quota = _11 === void 0 ? 0 : _11, _12 = _10.usage, usage = _12 === void 0 ? 0 : _12;
                        labelColor_1 = 3;
                        labelText_1 = function (text) {
                            var _a;
                            return "".concat(color_1.rgbAnsi.apply(void 0, color_1.colorAttributes[labelColor_1].rgb)).concat(text).concat(((_a = colorOutput.current) === null || _a === void 0 ? void 0 : _a[0]) || color_1.rgbAnsi.apply(void 0, color_1.colorAttributes[7].rgb));
                        };
                        output_2 = [
                            userId,
                            Array.from({ length: userId.length }).fill("-").join(""),
                            "OS: ".concat(alias, " ").concat((0, useTerminal_1.displayVersion)()),
                        ];
                        if (hostOS === null || hostOS === void 0 ? void 0 : hostOS.name) {
                            output_2.push("Host: ".concat(hostOS.name).concat((hostOS === null || hostOS === void 0 ? void 0 : hostOS.version) ? " ".concat(hostOS.version) : "").concat((cpu === null || cpu === void 0 ? void 0 : cpu.architecture) ? " ".concat(cpu === null || cpu === void 0 ? void 0 : cpu.architecture) : ""));
                        }
                        if (browser === null || browser === void 0 ? void 0 : browser.name) {
                            output_2.push("Kernel: ".concat(browser.name).concat((browser === null || browser === void 0 ? void 0 : browser.version) ? " ".concat(browser.version) : "").concat((engine === null || engine === void 0 ? void 0 : engine.name) ? " (".concat(engine.name, ")") : ""));
                        }
                        output_2.push("Uptime: ".concat((0, functions_1.getUptime)(true)), "Packages: ".concat(Object.entries(directory_1.default).filter(function (_a) {
                            var dialogProcess = _a[1].dialogProcess;
                            return !dialogProcess;
                        }).length));
                        if (((_48 = window.screen) === null || _48 === void 0 ? void 0 : _48.width) && ((_49 = window.screen) === null || _49 === void 0 ? void 0 : _49.height)) {
                            output_2.push("Resolution: ".concat(window.screen.width, "x").concat(window.screen.height));
                        }
                        output_2.push("Theme: ".concat(themeName));
                        if (terminalFont) {
                            output_2.push("Terminal Font: ".concat(terminalFont));
                        }
                        if (gpu === null || gpu === void 0 ? void 0 : gpu.vendor) {
                            output_2.push("GPU: ".concat(gpu.vendor).concat((gpu === null || gpu === void 0 ? void 0 : gpu.model) ? " ".concat(gpu.model) : ""));
                        }
                        else if (gpu === null || gpu === void 0 ? void 0 : gpu.model) {
                            output_2.push("GPU: ".concat(gpu.model));
                        }
                        if (window.performance && "memory" in window.performance) {
                            output_2.push("Memory: ".concat((window.performance.memory
                                .totalJSHeapSize /
                                1024 /
                                1024).toFixed(0), "MB / ").concat((window.performance.memory
                                .jsHeapSizeLimit /
                                1024 /
                                1024).toFixed(0), "MB"));
                        }
                        if (quota) {
                            output_2.push("Disk (/): ".concat((usage / 1024 / 1024 / 1024).toFixed(0), "G / ").concat((quota /
                                1024 /
                                1024 /
                                1024).toFixed(0), "G (").concat(((usage / quota) * 100).toFixed(2), "%)"));
                        }
                        longestLineLength = output_2.reduce(function (max, line) { return Math.max(max, line.length); }, 0);
                        maxCols = cols || config_1.config.cols || 70;
                        longestLine = config_1.PI_ASCII[0].length + longestLineLength;
                        imgPadding_1 = Math.max(Math.min(maxCols - longestLine, 3), 1);
                        output_2.push("\n", [0, 4, 2, 6, 1, 5, 3, 7]
                            .map(function (color) { return (0, functions_1.printColor)(color, colorOutput.current); })
                            .join(""), [8, "C", "A", "E", 9, "D", "B", "F"]
                            .map(function (color) { return (0, functions_1.printColor)(color, colorOutput.current); })
                            .join(""));
                        config_1.PI_ASCII.forEach(function (imgLine, lineIndex) {
                            var outputLine = output_2[lineIndex] || "";
                            if (lineIndex === 0) {
                                var _a = outputLine.split("@"), user = _a[0], system = _a[1];
                                outputLine = "".concat(labelText_1(user), "@").concat(labelText_1(system));
                            }
                            else {
                                var _b = outputLine.split(":"), label = _b[0], info = _b[1];
                                if (info) {
                                    outputLine = "".concat(labelText_1(label), ":").concat(info);
                                }
                            }
                            printLn("".concat(labelText_1(imgLine)).concat(outputLine.padStart(outputLine.length + imgPadding_1, " ") || ""));
                        });
                        return [3 /*break*/, 213];
                    case 127:
                        domainName = commandArgs[0];
                        if (!domainName) return [3 /*break*/, 136];
                        nsLookup = function (domain, server) {
                            if (server === void 0) { server = config_1.PRIMARY_NAME_SERVER[0]; }
                            return __awaiter(void 0, void 0, Promise, function () {
                                var _a, Answer;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, fetch("".concat(server, "?name=").concat(domain), {
                                                headers: { Accept: "application/dns-json" },
                                            })];
                                        case 1: return [4 /*yield*/, (_b.sent()).json()];
                                        case 2:
                                            _a = (_b.sent()).Answer, Answer = _a === void 0 ? [] : _a;
                                            return [2 /*return*/, Answer];
                                    }
                                });
                            });
                        };
                        answer = void 0;
                        primaryFailed = false;
                        _50.label = 128;
                    case 128:
                        _50.trys.push([128, 130, , 135]);
                        return [4 /*yield*/, nsLookup(domainName)];
                    case 129:
                        answer = _50.sent();
                        return [3 /*break*/, 135];
                    case 130:
                        _13 = _50.sent();
                        _50.label = 131;
                    case 131:
                        _50.trys.push([131, 133, , 134]);
                        primaryFailed = true;
                        return [4 /*yield*/, nsLookup(domainName, config_1.BACKUP_NAME_SERVER[0])];
                    case 132:
                        answer = _50.sent();
                        return [3 /*break*/, 134];
                    case 133:
                        _14 = _50.sent();
                        return [3 /*break*/, 134];
                    case 134: return [3 /*break*/, 135];
                    case 135:
                        if (answer) {
                            _15 = primaryFailed
                                ? config_1.BACKUP_NAME_SERVER
                                : config_1.PRIMARY_NAME_SERVER, server = _15[0], address = _15[1];
                            host = new URL(server).host;
                            printLn("Server:  ".concat(host));
                            printLn("Address:  ".concat(address));
                            printLn("");
                            printLn("Non-authoritative answer:");
                            printLn("Name:    ".concat(domainName));
                            printLn("Addresses:  ".concat(answer
                                .map(function (_a) {
                                var data = _a.data;
                                return data;
                            })
                                .join("\n          ")));
                            printLn("");
                        }
                        else {
                            printLn("Failed to contact name servers.");
                        }
                        _50.label = 136;
                    case 136: return [3 /*break*/, 213];
                    case 137: return [4 /*yield*/, Promise.resolve().then(function () { return require("utils/spawnSheep"); })];
                    case 138:
                        _16 = _50.sent(), countSheep = _16.countSheep, killSheep_1 = _16.killSheep, spawnSheep_1 = _16.spawnSheep;
                        _17 = commandArgs[0], count_1 = _17 === void 0 ? 1 : _17, _18 = commandArgs[1], duration = _18 === void 0 ? 0 : _18;
                        if (!(!Number.isNaN(count_1) && !Number.isNaN(duration))) return [3 /*break*/, 141];
                        count_1 = Number(count_1);
                        duration = Number(duration);
                        if (!(count_1 > 1)) return [3 /*break*/, 140];
                        return [4 /*yield*/, spawnSheep_1()];
                    case 139:
                        _50.sent();
                        count_1 -= 1;
                        _50.label = 140;
                    case 140:
                        maxDuration_1 = (duration || (count_1 > 1 ? 1 : 0)) * constants_1.MILLISECONDS_IN_SECOND;
                        Array.from({ length: count_1 === 0 ? countSheep() : count_1 })
                            .fill(0)
                            .map(function () { return Math.floor(Math.random() * maxDuration_1); })
                            .forEach(function (delay) {
                            return setTimeout(count_1 === 0 ? killSheep_1 : spawnSheep_1, delay);
                        });
                        _50.label = 141;
                    case 141: return [3 /*break*/, 213];
                    case 142:
                        (0, functions_1.printTable)([
                            ["Image Name", 25],
                            ["PID", 8],
                            ["Title", 16],
                        ], Object.entries(processesRef.current).map(function (_a, index) {
                            var pid = _a[0], title = _a[1].title;
                            return [pid, index.toString(), title];
                        }), printLn);
                        return [3 /*break*/, 213];
                    case 143:
                        file = commandArgs[0];
                        return [4 /*yield*/, getFullPath(file)];
                    case 144:
                        fullSourcePath = _50.sent();
                        return [4 /*yield*/, exists(fullSourcePath)];
                    case 145:
                        if (!_50.sent()) return [3 /*break*/, 149];
                        return [4 /*yield*/, readFile(fullSourcePath)];
                    case 146:
                        code = _50.sent();
                        if (!(code.length > 0)) return [3 /*break*/, 148];
                        return [4 /*yield*/, (0, python_1.runPython)(code.toString(), printLn)];
                    case 147:
                        _50.sent();
                        _50.label = 148;
                    case 148: return [3 /*break*/, 151];
                    case 149:
                        _19 = command.split(" "), _20 = _19[1], code = _20 === void 0 ? "version" : _20;
                        return [4 /*yield*/, (0, python_1.runPython)(code, printLn)];
                    case 150:
                        _50.sent();
                        _50.label = 151;
                    case 151: return [3 /*break*/, 213];
                    case 152:
                        file = commandArgs[0];
                        return [4 /*yield*/, getFullPath(file)];
                    case 153:
                        fullSourcePath = _50.sent();
                        return [4 /*yield*/, exists(fullSourcePath)];
                    case 154:
                        if (!_50.sent()) return [3 /*break*/, 158];
                        return [4 /*yield*/, readFile(fullSourcePath)];
                    case 155:
                        code = _50.sent();
                        if (!(code.length > 0)) return [3 /*break*/, 157];
                        return [4 /*yield*/, (0, js_1.runJs)(code.toString(), printLn)];
                    case 156:
                        _50.sent();
                        _50.label = 157;
                    case 157: return [3 /*break*/, 160];
                    case 158:
                        _21 = command.split(" "), code = _21[1];
                        return [4 /*yield*/, (0, js_1.runJs)(code, printLn)];
                    case 159:
                        _50.sent();
                        _50.label = 160;
                    case 160: return [3 /*break*/, 213];
                    case 161:
                        (0, functions_3.resetStorage)(rootFs).finally(function () { return window.location.reload(); });
                        return [3 /*break*/, 213];
                    case 162:
                        printLn("The current time is: ".concat((0, functions_4.getTZOffsetISOString)().slice(11, 22)));
                        return [3 /*break*/, 213];
                    case 163:
                        changeTitle(id, command.slice(command.indexOf(" ") + 1));
                        return [3 /*break*/, 213];
                    case 164:
                        file = commandArgs[0];
                        if (!file) return [3 /*break*/, 167];
                        return [4 /*yield*/, getFullPath(file)];
                    case 165:
                        fullPath = _50.sent();
                        dirName = (0, path_1.dirname)(fullPath);
                        _22 = updateFile;
                        _23 = path_1.join;
                        _24 = [dirName];
                        return [4 /*yield*/, createPath((0, path_1.basename)(fullPath), dirName, Buffer.from(""))];
                    case 166:
                        _22.apply(void 0, [_23.apply(void 0, _24.concat([_50.sent()]))]);
                        _50.label = 167;
                    case 167: return [3 /*break*/, 213];
                    case 168:
                        printLn("Uptime: ".concat((0, functions_1.getUptime)()));
                        return [3 /*break*/, 213];
                    case 169:
                        printLn((0, useTerminal_1.displayVersion)());
                        return [3 /*break*/, 213];
                    case 170:
                        file = commandArgs[0];
                        return [4 /*yield*/, getFullPath(file)];
                    case 171:
                        fullSourcePath = _50.sent();
                        _26 = loadWapm_1.default;
                        _27 = [commandArgs,
                            print,
                            printLn];
                        _29 = fullSourcePath.endsWith(".wasm");
                        if (!_29) return [3 /*break*/, 173];
                        return [4 /*yield*/, exists(fullSourcePath)];
                    case 172:
                        _29 = (_50.sent());
                        _50.label = 173;
                    case 173:
                        if (!_29) return [3 /*break*/, 175];
                        return [4 /*yield*/, readFile(fullSourcePath)];
                    case 174:
                        _28 = _50.sent();
                        return [3 /*break*/, 176];
                    case 175:
                        _28 = undefined;
                        _50.label = 176;
                    case 176: return [4 /*yield*/, _26.apply(void 0, _27.concat([_28, pipedCommand]))];
                    case 177:
                        _25 = _50.sent(), wasmName = _25[0], wasmFile = _25[1];
                        if (wasmName && wasmFile) {
                            writeFile((0, path_1.join)(constants_1.SYSTEM_PATH, "".concat(wasmName, ".wasm")), Buffer.from(wasmFile), true);
                        }
                        return [3 /*break*/, 213];
                    case 178: return [4 /*yield*/, fetch("https://wttr.in/?1nAF", constants_1.HIGH_PRIORITY_REQUEST)];
                    case 179:
                        response = _50.sent();
                        _30 = printLn;
                        return [4 /*yield*/, response.text()];
                    case 180:
                        _30.apply(void 0, [_50.sent()]);
                        _31 = colorOutput.current, bgAnsi = _31[0], fgAnsi = _31[1];
                        if (bgAnsi)
                            print(bgAnsi);
                        if (fgAnsi)
                            print(fgAnsi);
                        return [3 /*break*/, 213];
                    case 181:
                        printLn("".concat(window.location.hostname, "\\public"));
                        return [3 /*break*/, 213];
                    case 182:
                        open("V86", { url: config_1.LINUX_IMAGE_PATH });
                        updateRecentFiles(config_1.LINUX_IMAGE_PATH, "V86");
                        return [3 /*break*/, 213];
                    case 183:
                        file = commandArgs[0], _32 = commandArgs[1], format = _32 === void 0 ? "xlsx" : _32;
                        if (!(file && format)) return [3 /*break*/, 193];
                        return [4 /*yield*/, getFullPath(file)];
                    case 184:
                        fullPath = _50.sent();
                        ext = (0, functions_1.formatToExtension)(format);
                        return [4 /*yield*/, exists(fullPath)];
                    case 185:
                        _33 = (_50.sent());
                        if (!_33) return [3 /*break*/, 187];
                        return [4 /*yield*/, lstat(fullPath)];
                    case 186:
                        _33 = !(_50.sent()).isDirectory();
                        _50.label = 187;
                    case 187:
                        if (!_33) return [3 /*break*/, 191];
                        _34 = sheetjs_1.convertSheet;
                        return [4 /*yield*/, readFile(fullPath)];
                    case 188: return [4 /*yield*/, _34.apply(void 0, [_50.sent(), ext])];
                    case 189:
                        workBook = _50.sent();
                        dirName = (0, path_1.dirname)(fullPath);
                        _35 = updateFile;
                        _36 = path_1.join;
                        _37 = [dirName];
                        return [4 /*yield*/, createPath("".concat((0, path_1.basename)(file, (0, path_1.extname)(file)), ".").concat(ext), dirName, Buffer.from(workBook))];
                    case 190:
                        _35.apply(void 0, [_36.apply(void 0, _37.concat([_50.sent()]))]);
                        return [3 /*break*/, 192];
                    case 191:
                        printLn(FILE_NOT_FILE);
                        _50.label = 192;
                    case 192: return [3 /*break*/, 194];
                    case 193:
                        printLn(SYNTAX_ERROR);
                        _50.label = 194;
                    case 194: return [3 /*break*/, 213];
                    case 195:
                        if (!baseCommand) return [3 /*break*/, 213];
                        pid = (Object.entries(directory_1.default)
                            .filter(function (_a) {
                            var dialogProcess = _a[1].dialogProcess;
                            return !dialogProcess;
                        })
                            .find(function (_a) {
                            var process = _a[0];
                            return process.toLowerCase() === lcBaseCommand;
                        }) || [Run_1.resourceAliasMap[lcBaseCommand]])[0];
                        if (!pid) return [3 /*break*/, 199];
                        file = commandArgs[0];
                        return [4 /*yield*/, getFullPath(file)];
                    case 196:
                        fullPath = _50.sent();
                        _38 = file && fullPath;
                        if (!_38) return [3 /*break*/, 198];
                        return [4 /*yield*/, exists(fullPath)];
                    case 197:
                        _38 = (_50.sent());
                        _50.label = 198;
                    case 198:
                        openUrl = _38 ? fullPath : "";
                        open(pid, { url: openUrl });
                        if (openUrl)
                            updateRecentFiles(openUrl, pid);
                        return [3 /*break*/, 213];
                    case 199: return [4 /*yield*/, exists(baseCommand)];
                    case 200:
                        baseFileExists = _50.sent();
                        _39 = baseFileExists;
                        if (_39) return [3 /*break*/, 202];
                        return [4 /*yield*/, exists((0, path_1.join)(cd.current, baseCommand))];
                    case 201:
                        _39 = (_50.sent());
                        _50.label = 202;
                    case 202:
                        if (!_39) return [3 /*break*/, 209];
                        fileExtension = (0, functions_4.getExtension)(baseCommand);
                        _40 = (extensions_1.default[fileExtension] || {}).command, extCommand = _40 === void 0 ? "" : _40;
                        if (!extCommand) return [3 /*break*/, 204];
                        newCommand = "".concat(extCommand, " ").concat(baseCommand.includes(" ")
                            ? "\"".concat(baseCommand, "\"")
                            : baseCommand);
                        return [4 /*yield*/, commandInterpreter("".concat(newCommand).concat(commandArgs.length > 0
                                ? " ".concat(commandArgs.join(" "))
                                : ""), printLn, print, pipedCommand
                                ? newCommand.replace(baseCommand, pipedCommand)
                                : undefined)];
                    case 203:
                        _50.sent();
                        return [3 /*break*/, 208];
                    case 204:
                        fullFilePath = baseFileExists
                            ? baseCommand
                            : (0, path_1.join)(cd.current, baseCommand);
                        basePid = "";
                        baseUrl = fullFilePath;
                        if (!(fileExtension === constants_1.SHORTCUT_EXTENSION)) return [3 /*break*/, 206];
                        _41 = functions_2.getShortcutInfo;
                        return [4 /*yield*/, readFile(fullFilePath)];
                    case 205:
                        (_43 = _41.apply(void 0, [_50.sent()]), basePid = _43.pid, baseUrl = _43.url);
                        return [3 /*break*/, 207];
                    case 206:
                        basePid = (0, functions_2.getProcessByFileExtension)(fileExtension);
                        _50.label = 207;
                    case 207:
                        if (basePid) {
                            open(basePid, { url: baseUrl });
                            if (baseUrl)
                                updateRecentFiles(baseUrl, basePid);
                        }
                        else {
                            printLn((0, functions_1.unknownCommand)(baseCommand));
                        }
                        _50.label = 208;
                    case 208: return [3 /*break*/, 213];
                    case 209: return [4 /*yield*/, findCommandInSystemPath(baseCommand)];
                    case 210:
                        systemProgram = _50.sent();
                        if (!systemProgram) return [3 /*break*/, 212];
                        newCommand = "".concat(constants_1.SYSTEM_PATH, "/").concat(systemProgram);
                        return [4 /*yield*/, commandInterpreter("".concat(newCommand).concat(commandArgs.length > 0
                                ? " ".concat(commandArgs.join(" "))
                                : ""), printLn, print, pipedCommand === null || pipedCommand === void 0 ? void 0 : pipedCommand.replace(baseCommand, newCommand))];
                    case 211:
                        _50.sent();
                        return [3 /*break*/, 213];
                    case 212:
                        printLn((0, functions_1.unknownCommand)(baseCommand));
                        _50.label = 213;
                    case 213: return [3 /*break*/, 215];
                    case 214:
                        _42 = _50.sent();
                        printLn("An error occurred while attempting to execute the command");
                        return [3 /*break*/, 215];
                    case 215:
                        if (localEcho) {
                            readdir(cd.current).then(function (files) { return (0, functions_1.autoComplete)(files, localEcho); });
                        }
                        return [2 /*return*/, cd.current];
                }
            });
        });
    }, [
        cd,
        changeTitle,
        closeWithTransition,
        createPath,
        deletePath,
        exists,
        findCommandInSystemPath,
        fs,
        getFullPath,
        id,
        localEcho,
        lstat,
        mapFs,
        mkdirRecursive,
        open,
        processesRef,
        readFile,
        readdir,
        rename,
        rootFs,
        stat,
        terminal,
        themeName,
        updateFile,
        updateFolder,
        updateRecentFiles,
        writeFile,
    ]);
    var commandInterpreterRef = (0, react_1.useRef)(commandInterpreter);
    (0, react_1.useEffect)(function () {
        commandInterpreterRef.current = commandInterpreter;
    }, [commandInterpreter]);
    return commandInterpreterRef;
};
exports.default = useCommandInterpreter;
