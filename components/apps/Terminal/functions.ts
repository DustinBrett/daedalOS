import { colorAttributes, rgbAnsi } from "components/apps/Terminal/color";
import { commands as gitCommands } from "components/apps/Terminal/processGit";
import type { LocalEcho } from "components/apps/Terminal/types";
import { resourceAliasMap } from "components/system/Dialogs/Run";
import processDirectory from "contexts/process/directory";
import { ONE_DAY_IN_MILLISECONDS } from "utils/constants";

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
  color: "Specifies color attribute of console output.",
  copy: "Copies a file to another location.",
  date: "Displays the date.",
  del: "Deletes a file.",
  dir: "Displays list of entries in current directory.",
  echo: "Displays messages that are passed to it.",
  exit: "Quits the command interpreter.",
  ffmpeg: "Convert audio or video file to another format.",
  file: "Detects the MIME type of the file.",
  find: "Searches for a text string in a file or files.",
  git: "Read from git repositories.",
  help: "Provides Help information for commands.",
  history: "Displays command history list.",
  imagemagick: "Convert an image file to another format.",
  ipconfig: "Displays current IP.",
  license: "Displays license.",
  md: "Creates a directory.",
  mount: "Mounts a local file system directory.",
  move: "Moves file or directory.",
  neofetch: "Displays system information.",
  nslookup: "Displays DNS information about a domain.",
  pwd: "Prints the working directory.",
  python: "Run code through Python interpreter.",
  rd: "Removes a directory.",
  ren: "Renames a file or directory.",
  rm: "Removes a file or directory.",
  sheep: "Spawn a new sheep",
  shutdown: "Allows proper local shutdown of machine.",
  taskkill: "Kill or stop a running process or application.",
  tasklist: "Displays all currently running processes.",
  time: "Displays the system time.",
  title: "Sets the window title for the command interpreter.",
  touch: "Create empty file.",
  type: "Displays the contents of a file.",
  uptime: "Display the current uptime of the local system.",
  ver: "Displays the system version.",
  wapm: "Run universal Wasm binaries.",
  weather: "Weather forecast service",
  whoami: "Displays user information.",
  xlsx: "Convert a spreadsheet file to another format.",
};

export const aliases: Record<string, string[]> = {
  cd: ["chdir"],
  clear: ["cls"],
  copy: ["cp"],
  del: ["erase"],
  dir: ["ls"],
  exit: ["quit"],
  find: ["search"],
  git: ["isogit"],
  ipconfig: ["ifconfig", "whatsmyip"],
  md: ["mkdir"],
  move: ["mv"],
  neofetch: ["systeminfo"],
  python: ["py"],
  rd: ["rmdir"],
  ren: ["rename"],
  sheep: ["esheep"],
  shutdown: ["logout", "restart"],
  taskkill: ["kill"],
  tasklist: ["ps"],
  type: ["cat"],
  ver: ["version"],
  wapm: ["wax"],
  weather: ["wttr"],
};

const directoryCommands = new Set([
  "cat",
  "cd",
  "chdir",
  "copy",
  "cp",
  "del",
  "dir",
  "erase",
  "ffmpeg",
  "file",
  "imagemagick",
  "ls",
  "md",
  "mkdir",
  "move",
  "mv",
  "py",
  "python",
  "rd",
  "ren",
  "rename",
  "rm",
  "rmdir",
  "touch",
  "type",
  "vim",
  "xlsx",
]);

export const unknownCommand = (baseCommand: string): string =>
  `'${baseCommand}' is not recognized as an internal or external command, operable program or batch file.`;

export const autoComplete = (
  directory: string[],
  localEcho: LocalEcho
): void => {
  const { _autocompleteHandlers: handlers } = localEcho;

  handlers.forEach(({ fn }) => localEcho.removeAutocompleteHandler(fn));

  localEcho.addAutocompleteHandler((index: number, [command]): string[] => {
    if (index === 0) {
      return [...Object.keys(commands), ...directory];
    }
    if (index === 1) {
      const lowerCommand = command.toLowerCase();

      if (lowerCommand === "git") return Object.keys(gitCommands);
      if (directoryCommands.has(lowerCommand)) return directory;

      const lowerProcesses = Object.keys(processDirectory).map((pid) =>
        pid.toLowerCase()
      );

      if (
        lowerProcesses.includes(lowerCommand) ||
        Object.keys(resourceAliasMap).includes(lowerCommand)
      ) {
        return directory;
      }
    }

    return [];
  });
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
  headers: [string, number, boolean?, ((value: string) => string)?][],
  data: string[][],
  localEcho?: LocalEcho,
  hideHeader?: boolean,
  paddingCharacter = "="
): void => {
  if (!hideHeader) {
    const header = headers
      .map(([key, padding]) => key.padEnd(padding, " "))
      .join(" ");
    const divider = headers
      .map(([, padding]) => paddingCharacter.repeat(padding))
      .join(" ");

    localEcho?.println(header);
    localEcho?.println(divider);
  }

  const content = data.map((row) =>
    row
      .map((rowData, index) => {
        const [, padding, alignRight, modifier] = headers[index];
        let trunctatedText =
          index === row.length - 1 ? rowData : rowData.slice(0, padding);

        if (modifier) trunctatedText = modifier(trunctatedText);

        return alignRight
          ? trunctatedText.padStart(padding, " ")
          : trunctatedText.padEnd(padding, " ");
      })
      .join(" ")
  );

  if (content.length > 0) content.forEach((entry) => localEcho?.println(entry));
};

export const getFreeSpace = async (): Promise<string> => {
  const { quota = 0, usage = 0 } =
    (await navigator.storage?.estimate?.()) || {};

  if (quota === 0) return "";

  return `  ${(quota - usage).toLocaleString()} bytes`;
};

export const getUptime = (isShort = false): string => {
  if (window.performance) {
    const [{ duration }] = window.performance.getEntriesByType("navigation");
    const bootTime = window.performance.timeOrigin + duration;
    const uptimeInMilliseconds = Math.ceil(Date.now() - bootTime);
    const days = Math.floor(uptimeInMilliseconds / ONE_DAY_IN_MILLISECONDS);
    const uptime = new Date(uptimeInMilliseconds);
    const hours = uptime.getUTCHours();
    const mins = uptime.getUTCMinutes();
    const secs = uptime.getUTCSeconds();

    return [
      ...(days ? [`${days} day${days === 1 ? "" : "s"}`] : []),
      ...(hours ? [`${hours} hour${hours === 1 ? "" : "s"}`] : []),
      ...(mins
        ? [`${mins} ${isShort ? "min" : "minute"}${mins === 1 ? "" : "s"}`]
        : []),
      ...(secs
        ? [`${secs} ${isShort ? "sec" : "second"}${secs === 1 ? "" : "s"}`]
        : []),
    ].join(", ");
  }

  return "Unknown";
};

export const printColor = (
  colorIndex: number | string,
  colorOutput?: string[]
): string =>
  `${rgbAnsi(...colorAttributes[colorIndex].rgb, true)}${rgbAnsi(
    ...colorAttributes[colorIndex].rgb
  )}|||${
    colorOutput?.join("") ||
    `${rgbAnsi(...colorAttributes[0].rgb, true)}${rgbAnsi(
      ...colorAttributes[7].rgb
    )}`
  }\u001B[0m`;
