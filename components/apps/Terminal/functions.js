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
exports.formatToExtension = exports.readClipboardToTerminal = exports.printColor = exports.getUptime = exports.getFreeSpace = exports.printTable = exports.parseCommand = exports.autoComplete = exports.unknownCommand = exports.aliases = exports.commands = exports.help = void 0;
var path_1 = require("path");
var color_1 = require("components/apps/Terminal/color");
var processGit_1 = require("components/apps/Terminal/processGit");
var Run_1 = require("components/system/Dialogs/Run");
var directory_1 = require("contexts/process/directory");
var constants_1 = require("utils/constants");
var help = function (printLn, commandList, aliasList) {
    Object.entries(commandList).forEach(function (_a) {
        var command = _a[0], description = _a[1];
        printLn("".concat(command.padEnd(14), " ").concat(description));
    });
    if (aliasList) {
        printLn("\r\nAliases:\r\n");
        Object.entries(aliasList).forEach(function (_a) {
            var baseCommand = _a[0], aliasCommands = _a[1];
            aliasCommands.forEach(function (aliasCommand) {
                printLn("".concat(aliasCommand.padEnd(14), " ").concat(commandList[baseCommand]));
            });
        });
    }
};
exports.help = help;
exports.commands = {
    cd: "Changes the current directory.",
    clear: "Clears the screen.",
    color: "Specifies color attribute of console output.",
    copy: "Copies a file to another location.",
    date: "Displays the date.",
    del: "Deletes a file.",
    dir: "Displays list of entries in current directory.",
    echo: "Displays messages that are passed to it.",
    exit: "Quits the command interpreter.",
    ffmpeg: "Convert audio or video file to another format.",
    file: "Detects the MIME type of the file.",
    find: "Searches for a text string in a file or files.",
    git: "Read from git repositories.",
    help: "Provides Help information for commands.",
    history: "Displays command history list.",
    imagemagick: "Convert an image file to another format.",
    ipconfig: "Displays current IP.",
    license: "Displays license.",
    md: "Creates a directory.",
    mediainfo: "Displays relevant technical data about media files.",
    mount: "Mounts a local file system directory.",
    move: "Moves file or directory.",
    neofetch: "Displays system information.",
    nslookup: "Displays DNS information about a domain.",
    pwd: "Prints the working directory.",
    python: "Run code through Python interpreter.",
    qjs: "Run code through QuickJS interpreter.",
    rd: "Removes a directory.",
    ren: "Renames a file or directory.",
    rm: "Removes a file or directory.",
    sheep: "Spawn a new sheep.",
    shutdown: "Allows proper local shutdown of machine.",
    taskkill: "Kill or stop a running process or application.",
    tasklist: "Displays all currently running processes.",
    time: "Displays the system time.",
    title: "Sets the window title for the command interpreter.",
    touch: "Create empty file.",
    type: "Displays the contents of a file.",
    uptime: "Display the current uptime of the local system.",
    ver: "Displays the system version.",
    wapm: "Run universal Wasm binaries.",
    weather: "Weather forecast service.",
    whoami: "Displays user information.",
    wsl: "Launches the default Linux shell.",
    xlsx: "Convert a spreadsheet file to another format.",
};
exports.aliases = {
    cd: ["chdir"],
    clear: ["cls"],
    copy: ["cp"],
    del: ["erase"],
    dir: ["ls"],
    exit: ["quit"],
    find: ["search"],
    git: ["isogit"],
    ipconfig: ["ifconfig", "whatsmyip"],
    md: ["mkdir"],
    move: ["mv"],
    neofetch: ["systeminfo"],
    python: ["py", "python3"],
    qjs: ["node", "quickjs"],
    rd: ["rmdir"],
    ren: ["rename"],
    sheep: ["esheep"],
    shutdown: ["logout", "restart"],
    taskkill: ["kill"],
    tasklist: ["ps"],
    type: ["cat"],
    ver: ["version"],
    wapm: ["wasmer", "wax"],
    weather: ["wttr"],
    wsl: ["linux"],
};
var directoryCommands = new Set([
    "cat",
    "cd",
    "chdir",
    "copy",
    "cp",
    "del",
    "dir",
    "erase",
    "ffmpeg",
    "file",
    "imagemagick",
    "ls",
    "md",
    "mediainfo",
    "mkdir",
    "move",
    "mv",
    "node",
    "py",
    "python",
    "python3",
    "qjs",
    "quickjs",
    "rd",
    "ren",
    "rename",
    "rm",
    "rmdir",
    "touch",
    "type",
    "wapm",
    "wasmer",
    "wax",
    "xlsx",
]);
var unknownCommand = function (baseCommand) {
    return "zsh: ".concat(baseCommand, ": command not found");
};
exports.unknownCommand = unknownCommand;
var autoComplete = function (directory, localEcho) {
    var handlers = localEcho._autocompleteHandlers;
    handlers.forEach(function (_a) {
        var fn = _a.fn;
        return localEcho.removeAutocompleteHandler(fn);
    });
    localEcho.addAutocompleteHandler(function (index, _a) {
        var command = _a[0];
        if (index === 0) {
            return __spreadArray(__spreadArray([], Object.keys(exports.commands), true), directory, true);
        }
        if (index === 1) {
            var lowerCommand = command.toLowerCase();
            if (lowerCommand === "git")
                return Object.keys(processGit_1.commands);
            if (directoryCommands.has(lowerCommand))
                return directory;
            var lowerProcesses = Object.entries(directory_1.default)
                .filter(function (_a) {
                var dialogProcess = _a[1].dialogProcess;
                return !dialogProcess;
            })
                .map(function (_a) {
                var pid = _a[0];
                return pid.toLowerCase();
            });
            if (lowerProcesses.includes(lowerCommand) ||
                Object.keys(Run_1.resourceAliasMap).includes(lowerCommand)) {
                return directory;
            }
        }
        return [];
    });
};
exports.autoComplete = autoComplete;
var parseCommand = function (commandString, pipedCommand) {
    if (pipedCommand === void 0) { pipedCommand = ""; }
    var readingQuotedArg = false;
    var currentArg = "";
    var addArg = function (acc) {
        acc.push(currentArg);
        currentArg = "";
    };
    var parsedCommand = __spreadArray([], commandString, true).reduce(function (acc, char, index) {
        if (pipedCommand && index > pipedCommand.length) {
            currentArg += char;
        }
        else if (char === " " && !readingQuotedArg && currentArg) {
            addArg(acc);
        }
        else if (char === '"') {
            readingQuotedArg = !readingQuotedArg;
            if (!readingQuotedArg)
                addArg(acc);
        }
        else {
            currentArg += char;
        }
        return acc;
    }, []);
    return currentArg ? __spreadArray(__spreadArray([], parsedCommand, true), [currentArg], false) : parsedCommand;
};
exports.parseCommand = parseCommand;
var printTable = function (headers, data, printLn, hideHeader, paddingCharacter) {
    if (paddingCharacter === void 0) { paddingCharacter = "="; }
    if (!hideHeader) {
        var header = headers
            .map(function (_a) {
            var key = _a[0], padding = _a[1];
            return key.padEnd(padding, " ");
        })
            .join(" ");
        var divider = headers
            .map(function (_a) {
            var padding = _a[1];
            return paddingCharacter.repeat(padding);
        })
            .join(" ");
        printLn(header);
        printLn(divider);
    }
    var content = data.map(function (row) {
        return row
            .map(function (rowData, index) {
            var _a = headers[index], padding = _a[1], alignRight = _a[2], modifier = _a[3];
            var trunctatedText = index === row.length - 1 ? rowData : rowData.slice(0, padding);
            if (modifier)
                trunctatedText = modifier(trunctatedText);
            return alignRight
                ? trunctatedText.padStart(padding, " ")
                : trunctatedText.padEnd(padding, " ");
        })
            .join(" ");
    });
    if (content.length > 0)
        content.forEach(function (entry) { return printLn(entry); });
};
exports.printTable = printTable;
var getFreeSpace = function () { return __awaiter(void 0, void 0, Promise, function () {
    var _a, _b, quota, _c, usage;
    var _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, ((_e = (_d = navigator.storage) === null || _d === void 0 ? void 0 : _d.estimate) === null || _e === void 0 ? void 0 : _e.call(_d))];
            case 1:
                _a = (_f.sent()) || {}, _b = _a.quota, quota = _b === void 0 ? 0 : _b, _c = _a.usage, usage = _c === void 0 ? 0 : _c;
                if (quota === 0)
                    return [2 /*return*/, ""];
                return [2 /*return*/, "  ".concat((quota - usage).toLocaleString(), " bytes")];
        }
    });
}); };
exports.getFreeSpace = getFreeSpace;
var getUptime = function (isShort) {
    if (isShort === void 0) { isShort = false; }
    if (window.performance) {
        var duration = window.performance.getEntriesByType("navigation")[0].duration;
        var bootTime = window.performance.timeOrigin + duration;
        var uptimeInMilliseconds = Math.ceil(Date.now() - bootTime);
        var days = Math.floor(uptimeInMilliseconds / constants_1.ONE_DAY_IN_MILLISECONDS);
        var uptime = new Date(uptimeInMilliseconds);
        var hours = uptime.getUTCHours();
        var mins = uptime.getUTCMinutes();
        var secs = uptime.getUTCSeconds();
        return __spreadArray(__spreadArray(__spreadArray(__spreadArray([], (days ? ["".concat(days, " day").concat(days === 1 ? "" : "s")] : []), true), (hours ? ["".concat(hours, " hour").concat(hours === 1 ? "" : "s")] : []), true), (mins
            ? ["".concat(mins, " ").concat(isShort ? "min" : "minute").concat(mins === 1 ? "" : "s")]
            : []), true), [
            "".concat(secs, " ").concat(isShort ? "sec" : "second").concat(secs === 1 ? "" : "s"),
        ], false).join(", ");
    }
    return "Unknown";
};
exports.getUptime = getUptime;
var printColor = function (colorIndex, colorOutput) {
    return "".concat(color_1.rgbAnsi.apply(void 0, __spreadArray(__spreadArray([], color_1.colorAttributes[colorIndex].rgb, false), [true], false))).concat(color_1.rgbAnsi.apply(void 0, color_1.colorAttributes[colorIndex].rgb), "|||").concat((colorOutput === null || colorOutput === void 0 ? void 0 : colorOutput.join("")) ||
        "".concat(color_1.rgbAnsi.apply(void 0, __spreadArray(__spreadArray([], color_1.colorAttributes[0].rgb, false), [true], false))).concat(color_1.rgbAnsi.apply(void 0, color_1.colorAttributes[7].rgb)), "\u001B[0m");
};
exports.printColor = printColor;
var readClipboardToTerminal = function (localEcho) {
    var _a, _b;
    try {
        (_b = (_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.readText) === null || _b === void 0 ? void 0 : _b.call(_a).then(function (clipboardText) { return localEcho.handleCursorInsert(clipboardText); });
    }
    catch (_c) {
        // Ignore failure to read clipboard
    }
};
exports.readClipboardToTerminal = readClipboardToTerminal;
var formatToExtension = function (format) {
    var extension = format.toLowerCase().trim();
    return extension.startsWith(".")
        ? extension.slice(1)
        : extension.includes(".")
            ? (0, path_1.extname)(extension).slice(1)
            : extension;
};
exports.formatToExtension = formatToExtension;
