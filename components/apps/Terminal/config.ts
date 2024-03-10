import { type ITerminalOptions } from "xterm";
import processDirectory from "contexts/process/directory";

export const config: ITerminalOptions & { cols: number; rows: number } = {
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
    background: processDirectory.Terminal.backgroundColor,
    foreground: "rgb(204, 204, 204)",
  },
};

export const WAPM_STD_IN_APPS = ["lolcat"];

export const WAPM_STD_IN_EXCLUDE_ARGS = ["--help", "-h", "--version", "-V"];

export const PROMPT_CHARACTER = ">";

export const PI_ASCII = [
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

export const PRIMARY_NAME_SERVER = [
  "https://cloudflare-dns.com/dns-query",
  "1.1.1.1",
];
export const BACKUP_NAME_SERVER = ["https://dns.google/resolve", "8.8.8.8"];

export const LINUX_IMAGE_PATH = "/System/linux.bin";
