import type { ITerminalOptions } from "xterm";
import processDirectory from "contexts/process/directory";

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
    foreground: "rgb(251, 241, 199)",
  },
};

export const PROMPT_CHARACTER = ">";

export const PI_ASCII = [
  "                                 ",
  "                                 ",
  "                                 ",
  "               .::-::.           ",
  "-=.        -+#@@@@@@@@@%*-.      ",
  "%@@%=   -#@@@@@@@@@@@@*++#@%=    ",
  ":@@@@@*@@@@@@@@@@@@@* :+=..%@@+  ",
  " +@@@@@@@@@@@@@@@@@@: %@@+ +@@@@-",
  " -@@@@@@@@@@@@@@@@@@%: :. =@@@@@%",
  " %@@@@@@@@@@@@@@@@@@@@@%%@@@@@@+ ",
  "+@@@@+.+%@@@@@@@@@@@@@@@@@@@@+.  ",
  "#@#-     :+%@@@@@@@@@@@@@@*-     ",
  "             -=*#%%%#*+-.        ",
  "                                 ",
  "                                 ",
  "                                 ",
];
