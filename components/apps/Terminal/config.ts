import processDirectory from "contexts/process/directory";
import type { ITerminalOptions } from "xterm";

export const config: ITerminalOptions = {
  allowTransparency: true,
  cols: 70,
  cursorBlink: true,
  cursorStyle: "underline",
  cursorWidth: 8,
  fontFamily: "Consolas, Lucida Console, Courier New, monospace",
  fontSize: 14,
  fontWeight: "100",
  letterSpacing: 0.5,
  rows: 20,
  theme: {
    background: processDirectory.Terminal.backgroundColor,
    foreground: "rgb(204, 204, 204)",
  },
};

export const PROMPT_CHARACTER = ">";

export const PI_ASCII = [
  "    .':ldxxkkOOOOOOOOOOOOOOOOOOl",
  "  .lOKNWMMMMMMMMMMMMMMMMMMMMMMMO",
  " .kWWX0OOXWMN0000000NMMMN000000d",
  ".xKo,    lNWo.     .xMMMd       ",
  "cx,      lWN:      .kMMWc       ",
  "..       dMK,      '0MMX:       ",
  "        'OM0'      ;XMMK,       ",
  "        cNMk.      cWMMO.       ",
  "       '0MMd       oMMMx.       ",
  "      .xWMWl      .xMMMd        ",
  "     .xWMMX;      .OMMMd       .",
  "    ,OWMMMO.      '0MMMO.     :o",
  "  .cXMMMMWd       '0MMMWk;..'l0l",
  "  :XMMMMMK,        oWMMMMWXXNNd.",
  "  'kWMMW0;         .l0WMMMMNO:. ",
  "   .lkko.            .cxkkx:.   ",
];
