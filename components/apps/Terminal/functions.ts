import { extname } from "path";
import { colorAttributes, rgbAnsi } from "components/apps/Terminal/color";
import { commands as gitCommands } from "components/apps/Terminal/processGit";
import { type LocalEcho } from "components/apps/Terminal/types";
import { resourceAliasMap } from "components/system/Dialogs/Run";
import processDirectory from "contexts/process/directory";
import { ONE_DAY_IN_MILLISECONDS } from "utils/constants";

export const help = (
  printLn: (message: string) => void,
  commandList: Record<string, string>,
  aliasList?: Record<string, string[]>
): void => {
  Object.entries(commandList).forEach(([command, description]) => {
    printLn(`${command.padEnd(14)} ${description}`);
  });

  if (aliasList) {
    printLn("\r\nAliases:\r\n");
    Object.entries(aliasList).forEach(([baseCommand, aliasCommands]) => {
      aliasCommands.forEach((aliasCommand) => {
        printLn(`${aliasCommand.padEnd(14)} ${commandList[baseCommand]}`);
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
  mediainfo: "Displays relevant technical data about media files.",
  mount: "Mounts a local file system directory.",
  move: "Moves file or directory.",
  neofetch: "Displays system information.",
  nslookup: "Displays DNS information about a domain.",
  pwd: "Prints the working directory.",
  python: "Run code through Python interpreter.",
  qjs: "Run code through QuickJS interpreter.",
  rd: "Removes a directory.",
  ren: "Renames a file or directory.",
  rm: "Removes a file or directory.",
  sheep: "Spawn a new sheep.",
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
  weather: "Weather forecast service.",
  whoami: "Displays user information.",
  wsl: "Launches the default Linux shell.",
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
  python: ["py", "python3"],
  qjs: ["eval", "node", "quickjs"],
  rd: ["rmdir"],
  ren: ["rename"],
  sheep: ["esheep"],
  shutdown: ["logout", "restart"],
  taskkill: ["kill"],
  tasklist: ["ps"],
  type: ["cat"],
  ver: ["version"],
  wapm: ["wasmer", "wax"],
  weather: ["wttr"],
  whoami: ["logname"],
  wsl: ["linux"],
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
  "mediainfo",
  "mkdir",
  "move",
  "mv",
  "node",
  "py",
  "python",
  "python3",
  "qjs",
  "quickjs",
  "rd",
  "ren",
  "rename",
  "rm",
  "rmdir",
  "touch",
  "type",
  "wapm",
  "wasmer",
  "wax",
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
      return [
        ...Object.keys(commands),
        ...Object.values(aliases).flat(),
        ...directory,
      ];
    }
    if (index === 1) {
      const lowerCommand = command.toLowerCase();

      if (lowerCommand === "git") return Object.keys(gitCommands);
      if (directoryCommands.has(lowerCommand)) return directory;

      const lowerProcesses = Object.entries(processDirectory)
        .filter(([, { dialogProcess }]) => !dialogProcess)
        .map(([pid]) => pid.toLowerCase());

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

export const parseCommand = (
  commandString: string,
  pipedCommand = ""
): string[] => {
  let readingQuotedArg = false;
  let currentArg = "";
  const addArg = (acc: string[]): void => {
    acc.push(currentArg);
    currentArg = "";
  };
  const parsedCommand = [...commandString].reduce<string[]>(
    (acc, char, index) => {
      if (pipedCommand && index > pipedCommand.length) {
        currentArg += char;
      } else if (char === " " && !readingQuotedArg && currentArg) {
        addArg(acc);
      } else if (char === '"') {
        readingQuotedArg = !readingQuotedArg;
        if (!readingQuotedArg) addArg(acc);
      } else {
        currentArg += char;
      }

      return acc;
    },
    []
  );

  return currentArg ? [...parsedCommand, currentArg] : parsedCommand;
};

export const printTable = (
  headers: [string, number, boolean?, ((value: string) => string)?][],
  data: string[][],
  printLn: (message: string) => void,
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

    printLn(header);
    printLn(divider);
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

  if (content.length > 0) content.forEach((entry) => printLn(entry));
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
      `${secs} ${isShort ? "sec" : "second"}${secs === 1 ? "" : "s"}`,
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

export const clearAnsiBackground = (text: string): string =>
  text.replace(/;48;2;/g, ";48;0;").replace(/;48;5;/g, ";48;0;");

export const readClipboardToTerminal = (localEcho: LocalEcho): void => {
  try {
    navigator.clipboard
      ?.readText?.()
      .then((clipboardText) => localEcho.handleCursorInsert(clipboardText));
  } catch {
    // Ignore failure to read clipboard
  }
};

export const formatToExtension = (format: string): string => {
  const extension = format.toLowerCase().trim();

  return extension.startsWith(".")
    ? extension.slice(1)
    : extension.includes(".")
      ? extname(extension).slice(1)
      : extension;
};
