import {
  aliases,
  commands,
  help,
  unknownCommand,
} from "components/apps/Terminal/functions";
import loadWapm from "components/apps/Terminal/loadWapm";
import processGit from "components/apps/Terminal/processGit";
import { runPython } from "components/apps/Terminal/python";
import type {
  CommandInterpreter,
  LocalEcho,
} from "components/apps/Terminal/types";
import {
  displayLicense,
  displayVersion,
} from "components/apps/Terminal/useTerminal";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { join } from "path";
import { useRef } from "react";
import { HOME, ONE_DAY_IN_MILLISECONDS } from "utils/constants";
import { getTZOffsetISOString } from "utils/functions";
import type { Terminal } from "xterm";

const useCommandInterpreter = (
  id: string,
  terminal?: Terminal,
  localEcho?: LocalEcho
): CommandInterpreter => {
  const cd = useRef(HOME);
  const { exists, fs, readdir, readFile, resetStorage, stat, updateFolder } =
    useFileSystem();
  const {
    closeWithTransition,
    open,
    processes,
    title: changeTitle,
  } = useProcesses();

  return async (command = ""): Promise<string> => {
    const [baseCommand, ...commandArgs] = command.split(" ");
    const lcBaseCommand = baseCommand.toLowerCase();

    switch (lcBaseCommand) {
      case "cat":
      case "type": {
        const file = commandArgs.join(" ");

        if (file) {
          const fullPath = file.startsWith("/") ? file : join(cd.current, file);

          if (await exists(fullPath)) {
            if ((await stat(fullPath)).isDirectory()) {
              localEcho?.println("Access is denied.");
            } else {
              localEcho?.print((await readFile(fullPath)).toString());
            }
          } else {
            localEcho?.println("The system cannot find the path specified.");
          }
        } else {
          localEcho?.println("The syntax of the command is incorrect.");
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
            : join(cd.current, directory);

          if (await exists(fullPath)) {
            if (cd.current !== fullPath) {
              cd.current = fullPath;
            }
          } else {
            localEcho?.println("The system cannot find the path specified.");
          }
        } else {
          localEcho?.println(cd.current);
        }
        break;
      }
      case "clear":
      case "cls":
        terminal?.clear();
        terminal?.write("\u001B[2J");
        break;
      case "date": {
        localEcho?.println(
          `The current date is: ${getTZOffsetISOString().slice(0, 10)}`
        );
        break;
      }
      case "dir":
      case "ls":
        (await readdir(cd.current)).forEach((directory) =>
          localEcho?.println(directory)
        );
        break;
      case "echo":
        localEcho?.println(commandArgs.join(" "));
        break;
      case "exit":
      case "quit":
        closeWithTransition(id);
        break;
      case "git": {
        if (fs && localEcho) {
          await processGit(
            commandArgs,
            cd.current,
            localEcho,
            fs,
            exists,
            updateFolder
          );
        }
        break;
      }
      case "help":
        if (localEcho) help(localEcho, commands, aliases);
        break;
      case "history": {
        localEcho?.history.entries.forEach((entry, index) =>
          localEcho.println(`${(index + 1).toString().padStart(4)} ${entry}`)
        );
        break;
      }
      case "kill":
      case "taskkill": {
        const processName = commandArgs[0];

        if (processes[processName]) {
          closeWithTransition(processName);
          localEcho?.println(
            `SUCCESS: Sent termination signal to the process "${processName}".`
          );
        } else {
          localEcho?.println(`ERROR: The process "${processName}" not found.`);
        }
        break;
      }
      case "license":
        localEcho?.println(displayLicense);
        break;
      case "ps":
      case "tasklist":
        localEcho?.println(
          `${"PID".padEnd(25, " ")} ${"Title".padEnd(20, " ")}`
        );
        localEcho?.println(`${"".padEnd(25, "=")} ${"".padEnd(20, "=")}`);
        Object.entries(processes).forEach(([pid, { title }]) => {
          localEcho?.println(
            `${pid.slice(0, 25).padEnd(25, " ")} ${title
              .slice(0, 20)
              .padEnd(20, " ")}`
          );
        });
        break;
      case "py":
      case "python": {
        if (localEcho) await runPython(commandArgs.join(" "), localEcho);
        break;
      }
      case "restart":
      case "shutdown":
        resetStorage().finally(() => window.location.reload());
        break;
      case "time":
        localEcho?.println(
          `The current time is: ${getTZOffsetISOString().slice(11, 22)}`
        );
        break;
      case "title":
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

          localEcho?.println(`Uptime: ${daysOfUptime} days, ${displayUptime}`);
        } else {
          localEcho?.println(unknownCommand(baseCommand));
        }
        break;
      }
      case "ver":
      case "version":
        localEcho?.println(displayVersion());
        break;
      case "wapm":
      case "wax": {
        if (localEcho) await loadWapm(commandArgs, localEcho);
        break;
      }
      case "weather":
      case "wttr": {
        const response = await fetch("https://wttr.in/?1nAF");

        localEcho?.println(await response.text());
        break;
      }
      case "whoami":
        if (window.navigator.userAgent) {
          localEcho?.println(window.navigator.userAgent);
        } else {
          localEcho?.println(unknownCommand(baseCommand));
        }
        break;
      default:
        if (baseCommand) {
          const pid = Object.keys(processDirectory).find(
            (process) => process.toLowerCase() === lcBaseCommand
          );

          if (pid) {
            const file = commandArgs.join(" ");
            const fullPath =
              !file || file.startsWith("/") ? file : join(cd.current, file);

            open(pid, {
              url: fullPath && (await exists(fullPath)) ? fullPath : "",
            });
          } else {
            localEcho?.println(unknownCommand(baseCommand));
          }
        }
    }

    return cd.current;
  };
};

export default useCommandInterpreter;
