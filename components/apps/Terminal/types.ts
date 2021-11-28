import type { ITerminalAddon, Terminal } from "xterm";

export type CommandInterpreter = {
  cd: string;
  command: string;
  processCommand: () => void;
  setCommand: React.Dispatch<React.SetStateAction<string>>;
  setCursorPosition: (step: number) => void;
  setHistoryPosition: (step: number) => void;
  welcome: () => void;
};

export type OnKeyEvent = {
  domEvent: KeyboardEvent;
};

export type FitAddon = ITerminalAddon & { fit: () => void };

declare global {
  interface Window {
    Terminal?: typeof Terminal;
    FitAddon?: {
      FitAddon: new () => FitAddon;
    };
  }
}
