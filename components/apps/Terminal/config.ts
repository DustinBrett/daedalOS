import processDirectory from "contexts/process/directory";
import type { ITerminalOptions } from "xterm";

export const config: ITerminalOptions = {
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

export const PRIMARY_NAME_SERVER = [
  "https://cloudflare-dns.com/dns-query",
  "1.1.1.1",
];
export const BACKUP_NAME_SERVER = ["https://dns.google/resolve", "8.8.8.8"];
