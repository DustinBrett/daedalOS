import type { LocalEcho } from "components/apps/Terminal/types";

export const help = (
  localEcho: LocalEcho,
  commandList: Record<string, string>,
  aliasList?: Record<string, string[]>
): void => {
  Object.entries(commandList).forEach(([command, description]) => {
    localEcho?.println(`${command.padEnd(14)} ${description}`);
  });

  if (aliasList) {
    localEcho?.println("\r\nAliases:\r\n");
    Object.entries(aliasList).forEach(([baseCommand, aliasCommands]) => {
      aliasCommands.forEach((aliasCommand) => {
        localEcho?.println(
          `${aliasCommand.padEnd(14)} ${commandList[baseCommand]}`
        );
      });
    });
  }
};

export const commands: Record<string, string> = {
  cd: "Changes the current directory.",
  clear: "Clears the screen.",
  date: "Displays the date.",
  dir: "Displays list of entries in current directory.",
  echo: "Displays messages that are passed to it.",
  exit: "Quits the command interpreter.",
  git: "Read from git repositories.",
  help: "Provides Help information for commands.",
  history: "Displays command history list.",
  license: "Displays license.",
  pwd: "Prints the working directory.",
  python: "Run code through Python interpreter.",
  shutdown: "Allows proper local shutdown of machine.",
  taskkill: "Kill or stop a running process or application.",
  tasklist: "Displays all currently running processes.",
  time: "Displays the system time.",
  title: "Sets the window title for the command interpreter.",
  type: "Displays the contents of a file.",
  uptime: "Display the current uptime of the local system.",
  ver: "Displays the system version.",
  wapm: "Run universal Wasm binaries.",
  weather: "Weather forecast service",
  whoami: "Displays user information.",
};

export const aliases: Record<string, string[]> = {
  cd: ["chdir"],
  clear: ["cls"],
  dir: ["ls"],
  exit: ["quit"],
  python: ["py"],
  shutdown: ["restart"],
  taskkill: ["kill"],
  tasklist: ["ps"],
  type: ["cat"],
  ver: ["version"],
  wapm: ["wax"],
  weather: ["wttr"],
};

export const unknownCommand = (baseCommand: string): string =>
  `'${baseCommand}' is not recognized as an internal or external command, operable program or batch file.`;

export const autoComplete = (
  directory: string[],
  localEcho: LocalEcho
): void => {
  const { _autocompleteHandlers: handlers } = localEcho;

  handlers.forEach(({ fn }) => localEcho.removeAutocompleteHandler(fn));

  localEcho.addAutocompleteHandler((index: number): string[] =>
    index === 0 ? Object.keys(commands) : directory || []
  );
};

export const parseCommand = (commandString: string): string[] => {
  let readingQuotedArg = false;
  let currentArg = "";
  const addArg = (acc: string[]): void => {
    if (currentArg) acc.push(currentArg);
    currentArg = "";
  };
  const parsedCommand = [...commandString].reduce<string[]>((acc, char) => {
    if (char === " " && !readingQuotedArg) addArg(acc);
    else if (char === '"') {
      readingQuotedArg = !readingQuotedArg;
      if (!readingQuotedArg) addArg(acc);
    } else {
      currentArg += char;
    }

    return acc;
  }, []);

  return currentArg ? [...parsedCommand, currentArg] : parsedCommand;
};

export const printTable = (
  headers: [string, number][],
  data: string[][],
  localEcho?: LocalEcho,
  paddingCharacter = "="
): void => {
  const header = headers
    .map(([key, padding]) => key.padEnd(padding, " "))
    .join(" ");
  const divider = headers
    .map(([, padding]) => paddingCharacter.repeat(padding))
    .join(" ");
  const content = data.map((row) =>
    row
      .map((rowData, index) =>
        rowData.padEnd(headers[index][1], " ").slice(0, headers[index][1])
      )
      .join(" ")
  );

  localEcho?.println(header);
  localEcho?.println(divider);

  if (content.length > 0) content.forEach((entry) => localEcho?.println(entry));
};
