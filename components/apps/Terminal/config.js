"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LINUX_IMAGE_PATH = exports.BACKUP_NAME_SERVER = exports.PRIMARY_NAME_SERVER = exports.PI_ASCII = exports.PROMPT_CHARACTER = exports.WAPM_STD_IN_EXCLUDE_ARGS = exports.WAPM_STD_IN_APPS = exports.config = void 0;
var directory_1 = require("contexts/process/directory");
exports.config = {
    allowTransparency: true,
    cols: 70,
    cursorBlink: true,
    cursorInactiveStyle: "none",
    cursorStyle: "underline",
    cursorWidth: 8,
    fontFamily: "Consolas, Lucida Console, Courier New, monospace",
    fontSize: 14,
    fontWeight: "100",
    rows: 20,
    theme: {
        background: directory_1.default.Terminal.backgroundColor,
        foreground: "rgb(15, 204, 15)",
    },
};
exports.WAPM_STD_IN_APPS = ["lolcat"];
exports.WAPM_STD_IN_EXCLUDE_ARGS = ["--help", "-h", "--version", "-V"];
exports.PROMPT_CHARACTER = "";
exports.PI_ASCII = [
    "     ':lodxkkkOOOOOOOOOOOOkkkkkl",
    "  .ckKNWMMMMMMMMMMMMMMMMMMMMMMMO",
    " .kWNK0OOKWMX0OOOOO0NMMMN000000d",
    ".dKo,.   cNWo      .xMMWo       ",
    ":x'      cWN:      .kMMWc       ",
    "..       dMK,      '0MMX;       ",
    "        .OMO.      ;XMM0,       ",
    "        cNMx.      cNMMk.       ",
    "       .OMMd       oMMMx.       ",
    "      .xWMWc      .xMMMd        ",
    "     .xWMMX;      .kMMMd        ",
    "    'OWMMMO.      '0MMMO.     :o",
    "   cKMMMMWo       '0MMMWk;..'l0c",
    "  ;XMMMMM0,        oWMMMMWXXNNd.",
    "  .kWMMW0;         .l0WMMMMNO:  ",
    "   .lkkl.            .cxkkd:.   ",
];
exports.PRIMARY_NAME_SERVER = [
    "https://cloudflare-dns.com/dns-query",
    "1.1.1.1",
];
exports.BACKUP_NAME_SERVER = ["https://dns.google/resolve", "8.8.8.8"];
exports.LINUX_IMAGE_PATH = "/System/linux.bin";
