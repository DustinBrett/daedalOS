import { type ITerminalAddon, type Terminal } from "xterm";

export type CommandInterpreter = (command?: string) => Promise<string>;

export type FitAddon = ITerminalAddon & { fit: () => void };

export type LocalEcho = ITerminalAddon & {
  _autocompleteHandlers: { fn: unknown }[];
  _termSize: {
    cols: number;
    rows: number;
  };
  addAutocompleteHandler: (
    callback: (index: number, tokens: string[]) => string[]
  ) => void;
  handleCursorInsert: (text: string) => void;
  history: {
    entries: string[];
  };
  print: (message: string) => void;
  printWide: (message: string) => void;
  println: (message: string) => void;
  read: (prompt: string) => Promise<string>;
  removeAutocompleteHandler: (callback: unknown) => void;
};

export type OnKeyEvent = {
  domEvent: KeyboardEvent;
};

type LocalEchoOptions = {
  historySize?: number;
};

declare global {
  interface Window {
    FitAddon?: {
      FitAddon: new () => FitAddon;
    };
    LocalEchoController?: new (
      terminal?: Terminal,
      options?: LocalEchoOptions
    ) => LocalEcho;
    Terminal?: typeof Terminal;
  }
}

export type NsEntry = {
  data: string;
};

export type NsResponse = {
  Answer: NsEntry[];
};
