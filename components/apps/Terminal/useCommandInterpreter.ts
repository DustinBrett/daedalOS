import { BACKSPACE, LEFT, RIGHT } from "components/apps/Terminal/config";
import help from "components/apps/Terminal/help";
import loadWapm from "components/apps/Terminal/loadWapm";
import processGit from "components/apps/Terminal/processGit";
import { runPython } from "components/apps/Terminal/python";
import type { CommandInterpreter } from "components/apps/Terminal/types";
import { convertNewLines } from "components/apps/Terminal/useTerminal";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import packageJson from "package.json";
import { join } from "path";
import { useState } from "react";
import { HOME, ONE_DAY_IN_MILLISECONDS } from "utils/constants";
import { getTimezoneOffsetISOString } from "utils/functions";
import type { Terminal } from "xterm";

const { alias, author, license, name, version } = packageJson;

const displayLicense = `${license} License`;
const displayVersion = (): string => {
  const { commit } = window;

  return `${version}${commit ? `-${commit}` : ""}`;
};

const commands: Record<string, string> = {
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

const aliases: Record<string, string[]> = {
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

const useCommandInterpreter = (
  id: string,
  terminal?: Terminal
): CommandInterpreter => {
  const [cd, setCd] = useState<string>(HOME);
  const [history, setHistory] = useState([""]);
  const [cursor, setCursor] = useState(0);
  const [position, setPosition] = useState(0);
  const [command, setCommand] = useState<string>("");
  const { exists, fs, readdir, readFile, resetFs, stat, updateFolder } =
    useFileSystem();
  const setCommandLine: React.Dispatch<React.SetStateAction<string>> = (
    cmd
  ): void => {
    const newCommand = typeof cmd === "function" ? cmd(command) : cmd;

    setCommand(newCommand);
    setCursor(newCommand.length);
  };
  const setHistoryPosition = (step: number): void => {
    const newPosition = position + step;

    if (newPosition < 0 || newPosition > history.length - 2) return;

    if (typeof history[newPosition] === "string") {
      terminal?.write(
        `${BACKSPACE.repeat(command.length)}${history[newPosition]}`
      );
      setCommandLine(history[newPosition]);
    }

    setPosition(newPosition);
  };
  const setCursorPosition = (step: number): void => {
    const cursorMove = cursor + step;

    if (cursorMove < 0 || cursorMove > command.length) return;

    terminal?.write(
      step > 0 ? RIGHT.repeat(step) : LEFT.repeat(Math.abs(step))
    );

    setCursor(cursorMove);
  };
  const clear = (): void => {
    terminal?.clear();
    terminal?.write("\u001B[2K\r");
  };
  const {
    closeWithTransition,
    open,
    processes,
    title: changeTitle,
  } = useProcesses();
  const newLine = (): void => terminal?.writeln("");
  const welcome = (): void => {
    terminal?.writeln(`${alias || name} [Version ${displayVersion()}]`);
    terminal?.writeln(`By ${author}. ${displayLicense}.`);
  };
  const unknownCommand = (baseCommand: string): void =>
    terminal?.writeln(
      `\r\n'${baseCommand}' is not recognized as an internal or external command, operable program or batch file.`
    );
  const processCommand = async (): Promise<void> => {
    const [baseCommand, ...commandArgs] = command.split(" ");
    const lcBaseCommand = baseCommand.toLowerCase();
    let currentCd = cd;

    switch (lcBaseCommand) {
      case "cat":
      case "type": {
        const file = commandArgs.join(" ");

        if (file) {
          const fullPath = file.startsWith("/") ? file : join(cd, file);

          if (await exists(fullPath)) {
            if ((await stat(fullPath)).isDirectory()) {
              terminal?.writeln("\r\nAccess is denied.");
            } else {
              terminal?.write(`\r\n${await readFile(fullPath)}`);
            }
          } else {
            terminal?.writeln(`\r\nThe system cannot find the path specified.`);
          }
        } else {
          terminal?.writeln(`\r\nThe syntax of the command is incorrect.`);
        }
        break;
      }
      case "cd":
      case "chdir":
      case "pwd": {
        const directory = commandArgs.join(" ");

        if (directory && lcBaseCommand !== "pwd") {
          const fullPath = directory.startsWith("/")
            ? directory
            : join(cd, directory);

          if (await exists(fullPath)) {
            if (currentCd !== fullPath) {
              currentCd = fullPath;
              setCd(fullPath);
            } else {
              newLine();
            }
          } else {
            terminal?.writeln(`\r\nThe system cannot find the path specified.`);
          }
        } else {
          terminal?.writeln(`\r\n${cd}`);
        }
        break;
      }
      case "clear":
      case "cls":
        clear();
        break;
      case "date": {
        terminal?.writeln(
          `\r\nThe current date is: ${getTimezoneOffsetISOString().slice(
            0,
            10
          )}`
        );
        break;
      }
      case "dir":
      case "ls":
        newLine();
        (await readdir(currentCd)).forEach((directory) =>
          terminal?.writeln(directory)
        );
        break;
      case "echo":
        terminal?.writeln(`\r\n${commandArgs.join(" ")}`);
        break;
      case "exit":
      case "quit":
        closeWithTransition(id);
        break;
      case "git": {
        if (fs && terminal) {
          await processGit(commandArgs, cd, terminal, fs, exists, updateFolder);
        }
        break;
      }
      case "help":
        newLine();
        if (terminal) help(terminal, commands, aliases);
        break;
      case "history": {
        const newHistory = [...history.slice(0, -1), command];

        newLine();
        newHistory.forEach((entry, index) =>
          terminal?.writeln(`${index.toString().padStart(4)} ${entry}`)
        );
        break;
      }
      case "kill":
      case "taskkill": {
        const processName = commandArgs[0];

        if (processes[processName]) {
          closeWithTransition(processName);
          terminal?.writeln(
            `\r\nSUCCESS: Sent termination signal to the process "${processName}".`
          );
        } else {
          terminal?.writeln(
            `\r\nERROR: The process "${processName}" not found.`
          );
        }
        break;
      }
      case "license":
        terminal?.writeln(`\r\n\r\n${displayLicense}`);
        break;
      case "ps":
      case "tasklist":
        newLine();
        newLine();
        terminal?.writeln(
          `${"PID".padEnd(25, " ")} ${"Title".padEnd(20, " ")}`
        );
        terminal?.writeln(`${"".padEnd(25, "=")} ${"".padEnd(20, "=")}`);
        Object.entries(processes).forEach(([pid, { title }]) => {
          terminal?.writeln(
            `${pid.slice(0, 25).padEnd(25, " ")} ${title
              .slice(0, 20)
              .padEnd(20, " ")}`
          );
        });
        break;
      case "py":
      case "python": {
        if (terminal) await runPython(commandArgs.join(" "), terminal);
        break;
      }
      case "restart":
      case "shutdown":
        newLine();
        resetFs().finally(() => window.location.reload());
        break;
      case "time":
        terminal?.writeln(
          `\r\nThe current time is: ${getTimezoneOffsetISOString().slice(
            11,
            22
          )}`
        );
        break;
      case "title":
        newLine();
        changeTitle(id, commandArgs.join(" "));
        break;
      case "uptime": {
        if (window.performance) {
          const [{ duration }] =
            window.performance.getEntriesByType("navigation");
          const bootTime = window.performance.timeOrigin + duration;
          const uptimeInMilliseconds = Math.ceil(Date.now() - bootTime);
          const daysOfUptime = Math.floor(
            uptimeInMilliseconds / ONE_DAY_IN_MILLISECONDS
          );
          const displayUptime = new Date(uptimeInMilliseconds)
            .toISOString()
            .slice(11, 19);

          terminal?.writeln(
            `\r\nUptime: ${daysOfUptime} days, ${displayUptime}`
          );
        } else {
          unknownCommand(baseCommand);
        }
        break;
      }
      case "ver":
      case "version":
        terminal?.writeln(`\r\n\r\n${displayVersion()}`);
        break;
      case "wapm":
      case "wax": {
        await loadWapm(commandArgs, terminal);
        break;
      }
      case "weather":
      case "wttr": {
        const response = await fetch("https://wttr.in/?1nAF");

        terminal?.write(`\r\n${convertNewLines(await response.text())}`);
        break;
      }
      case "whoami":
        if (window.navigator.userAgent) {
          terminal?.writeln(`\r\n${window.navigator.userAgent}`);
        } else {
          unknownCommand(baseCommand);
        }
        break;
      default:
        if (baseCommand) {
          const pid = Object.keys(processDirectory).find(
            (process) => process.toLowerCase() === lcBaseCommand
          );

          if (pid) {
            const file = commandArgs.join(" ");
            const fullPath = file.startsWith("/") ? file : join(cd, file);

            open(pid, {
              url: fullPath && (await exists(fullPath)) ? fullPath : "",
            });

            newLine();
          } else {
            unknownCommand(baseCommand);
          }
        }
    }

    terminal?.write(`\r\n${cd !== currentCd ? "\r\n" : ""}${currentCd}>`);

    if (command !== "") {
      if (command !== history[history.length - 2]) {
        setHistory((currentHistory) => [
          ...currentHistory.slice(0, -1),
          command,
          "",
        ]);
        setPosition(history.length);
      } else {
        setPosition(history.length - 1);
      }

      setCommandLine("");
    }
  };

  return {
    cd,
    command,
    processCommand,
    setCommand: setCommandLine,
    setCursorPosition,
    setHistoryPosition,
    welcome,
  };
};

export default useCommandInterpreter;
