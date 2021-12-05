import type { ITerminalAddon, Terminal } from "xterm";

export type CommandInterpreter = (command?: string) => Promise<string>;

export type FitAddon = ITerminalAddon & { fit: () => void };

export type LocalEcho = ITerminalAddon & {
  _cursor: number;
  _input: string;
  addAutocompleteHandler: (
    callback: (index: number, tokens: string[]) => string[]
  ) => void;
  history: {
    entries: string[];
  };
  print: (message: string) => void;
  println: (message: string) => void;
  printWide: (message: string) => void;
  read: (prompt: string) => Promise<string>;
};

export type OnKeyEvent = {
  domEvent: KeyboardEvent;
};

type LocalEchoOptions = {
  historySize?: number;
};

declare global {
  interface Window {
    Terminal?: typeof Terminal;
    FitAddon?: {
      FitAddon: new () => FitAddon;
    };
    LocalEchoController?: new (
      terminal?: Terminal,
      options?: LocalEchoOptions
    ) => LocalEcho;
  }
}
