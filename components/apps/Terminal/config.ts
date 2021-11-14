import processDirectory from "contexts/process/directory";
import type { ITerminalOptions } from "xterm";

export const BACKSPACE = "\b \b";

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
    background: processDirectory["Terminal"].background,
    foreground: "rgb(204, 204, 204)",
  },
};

export const libs = [
  "/Program Files/Xterm.js/xterm.css",
  "/Program Files/Xterm.js/xterm.js",
];

export const PROMPT_CHARACTER = ">";
