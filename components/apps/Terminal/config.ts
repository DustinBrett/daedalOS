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
