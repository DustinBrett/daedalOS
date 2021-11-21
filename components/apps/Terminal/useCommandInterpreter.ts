import type { CommandInterpreter } from "components/apps/Terminal/types";
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

const useCommandInterpreter = (
  id: string,
  terminal?: Terminal
): CommandInterpreter => {
  const [cd, setCd] = useState<string>(HOME);
  const [command, setCommand] = useState<string>("");
  const { exists, readdir, readFile, resetFs, stat } = useFileSystem();
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
      case "reboot":
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

            open(pid, fullPath && (await exists(fullPath)) ? fullPath : "");

            newLine();
          } else {
            unknownCommand(baseCommand);
          }
        }
    }

    terminal?.write(`\r\n${cd !== currentCd ? "\r\n" : ""}${currentCd}>`);

    return setCommand("");
  };

  return {
    cd,
    command,
    processCommand,
    setCommand,
    welcome,
  };
};

export default useCommandInterpreter;
