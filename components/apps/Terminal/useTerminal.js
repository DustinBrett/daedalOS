"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayVersion = exports.displayLicense = void 0;
var path_1 = require("path");
var react_1 = require("react");
var config_1 = require("components/apps/Terminal/config");
var functions_1 = require("components/apps/Terminal/functions");
var useCommandInterpreter_1 = require("components/apps/Terminal/useCommandInterpreter");
var extensions_1 = require("components/system/Files/FileEntry/extensions");
var fileSystem_1 = require("contexts/fileSystem");
var process_1 = require("contexts/process");
var session_1 = require("contexts/session");
var useResizeObserver_1 = require("hooks/useResizeObserver");
var constants_1 = require("utils/constants");
var functions_2 = require("utils/functions");
var alias = constants_1.PACKAGE_DATA.alias, author = constants_1.PACKAGE_DATA.author, license = constants_1.PACKAGE_DATA.license, version = constants_1.PACKAGE_DATA.version;
exports.displayLicense = "".concat(license, " License");
var displayVersion = function () {
    var _a = window.__NEXT_DATA__, _b = _a === void 0 ? {} : _a, buildId = _b.buildId;
    return "".concat(version).concat(buildId ? "-".concat(buildId) : "");
};
exports.displayVersion = displayVersion;
var useTerminal = function (_a) {
    var containerRef = _a.containerRef, id = _a.id, loading = _a.loading, setLoading = _a.setLoading, url = _a.url;
    var _b = (0, process_1.useProcesses)(), setUrl = _b.url, _c = id, _d = _b.processes[_c], _e = _d === void 0 ? {} : _d, _f = _e.closing, closing = _f === void 0 ? false : _f, _g = _e.libs, libs = _g === void 0 ? [] : _g;
    var readdir = (0, fileSystem_1.useFileSystem)().readdir;
    var _h = (0, react_1.useState)(), terminal = _h[0], setTerminal = _h[1];
    var _j = (0, react_1.useState)(), fitAddon = _j[0], setFitAddon = _j[1];
    var _k = (0, react_1.useState)(), localEcho = _k[0], setLocalEcho = _k[1];
    var cd = (0, react_1.useRef)((!localEcho && url && !(0, path_1.extname)(url) ? url : "") || constants_1.HOME);
    var _l = (0, react_1.useState)(""), initialCommand = _l[0], setInitialCommand = _l[1];
    var _m = (0, react_1.useState)(false), prompted = _m[0], setPrompted = _m[1];
    var processCommand = (0, useCommandInterpreter_1.default)(id, cd, terminal, localEcho);
    var autoFit = (0, react_1.useCallback)(function () { return fitAddon === null || fitAddon === void 0 ? void 0 : fitAddon.fit(); }, [fitAddon]);
    var foregroundId = (0, session_1.useSession)().foregroundId;
    (0, react_1.useEffect)(function () {
        if (url) {
            if (localEcho) {
                localEcho.handleCursorInsert(url.includes(" ") ? "\"".concat(url, "\"") : url);
            }
            else {
                var fileExtension = (0, functions_2.getExtension)(url);
                var _a = (extensions_1.default[fileExtension] || {}).command, extCommand = _a === void 0 ? "" : _a;
                if (extCommand) {
                    setInitialCommand("".concat(extCommand, " ").concat(url.includes(" ") ? "\"".concat(url, "\"") : url));
                }
            }
            setUrl(id, "");
        }
    }, [id, localEcho, setUrl, url]);
    (0, react_1.useEffect)(function () {
        (0, functions_2.loadFiles)(libs).then(function () {
            if (window.Terminal)
                setTerminal(new window.Terminal(config_1.config));
        });
    }, [libs]);
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (terminal &&
            loading &&
            containerRef.current &&
            window.FitAddon &&
            window.LocalEchoController) {
            var newFitAddon = new window.FitAddon.FitAddon();
            var newLocalEcho_1 = new window.LocalEchoController(undefined, {
                historySize: 1000,
            });
            terminal.loadAddon(newLocalEcho_1);
            terminal.loadAddon(newFitAddon);
            terminal.open(containerRef.current);
            newFitAddon.fit();
            setFitAddon(newFitAddon);
            setLocalEcho(newLocalEcho_1);
            containerRef.current.addEventListener("contextmenu", function (event) {
                var _a;
                (0, functions_2.haltEvent)(event);
                var textSelection = terminal.getSelection();
                if (textSelection) {
                    (_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText(textSelection);
                    terminal.clearSelection();
                }
                else {
                    (0, functions_1.readClipboardToTerminal)(newLocalEcho_1);
                }
            });
            (_b = (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.closest("section")) === null || _b === void 0 ? void 0 : _b.addEventListener("focus", function () { var _a; return (_a = terminal === null || terminal === void 0 ? void 0 : terminal.textarea) === null || _a === void 0 ? void 0 : _a.focus(constants_1.PREVENT_SCROLL); }, { passive: true });
            setLoading(false);
        }
        return function () {
            if (terminal && closing)
                terminal.dispose();
        };
    }, [closing, containerRef, loading, setLoading, terminal]);
    (0, react_1.useEffect)(function () {
        var _a;
        var currentOnKey;
        if (terminal && localEcho) {
            (_a = terminal.textarea) === null || _a === void 0 ? void 0 : _a.setAttribute("enterkeyhint", "send");
            currentOnKey = terminal.onKey(function (_a) {
                var _b = _a.domEvent, ctrlKey = _b.ctrlKey, code = _b.code;
                if (ctrlKey && code === "KeyV") {
                    (0, functions_1.readClipboardToTerminal)(localEcho);
                }
            });
        }
        return function () { return currentOnKey === null || currentOnKey === void 0 ? void 0 : currentOnKey.dispose(); };
    }, [localEcho, terminal]);
    (0, react_1.useEffect)(function () {
        if (localEcho && terminal && !prompted) {
            var prompt_1 = function () {
                return localEcho
                    .read("\r\n".concat(config_1.PROMPT_CHARACTER).concat(cd.current, "\n$\r\n "))
                    .then(function (command) { var _a; return (_a = processCommand.current) === null || _a === void 0 ? void 0 : _a.call(processCommand, command).then(prompt_1); });
            };
            localEcho.println("arcangelOS 3.31");
            if (initialCommand) {
                localEcho.println("\r\n".concat(config_1.PROMPT_CHARACTER).concat(cd.current, "\n$ ").concat(initialCommand, "\r\n"));
                localEcho.history.entries = [initialCommand];
                processCommand.current(initialCommand).then(prompt_1);
            }
            else {
                prompt_1();
            }
            setPrompted(true);
            terminal.focus();
            autoFit();
            readdir(cd.current).then(function (files) { return (0, functions_1.autoComplete)(files, localEcho); });
        }
    }, [
        autoFit,
        initialCommand,
        localEcho,
        processCommand,
        prompted,
        readdir,
        terminal,
    ]);
    (0, react_1.useLayoutEffect)(function () {
        var _a;
        if (id === foregroundId && !loading) {
            (_a = terminal === null || terminal === void 0 ? void 0 : terminal.textarea) === null || _a === void 0 ? void 0 : _a.focus(constants_1.PREVENT_SCROLL);
        }
    }, [foregroundId, id, loading, terminal]);
    (0, useResizeObserver_1.default)(containerRef.current, autoFit);
};
exports.default = useTerminal;
