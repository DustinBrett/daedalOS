import {
  aliases,
  autoComplete,
  commands,
  help,
  parseCommand,
  printTable,
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
import { basename, isAbsolute, join } from "path";
import { useCallback, useEffect, useRef } from "react";
import { HOME, ONE_DAY_IN_MILLISECONDS } from "utils/constants";
import { getTZOffsetISOString } from "utils/functions";
import type { Terminal } from "xterm";

const useCommandInterpreter = (
  id: string,
  terminal?: Terminal,
  localEcho?: LocalEcho
): React.MutableRefObject<CommandInterpreter> => {
  const cd = useRef(HOME);
  const { exists, fs, readdir, readFile, resetStorage, stat, updateFolder } =
    useFileSystem();
  const {
    closeWithTransition,
    open,
    processes,
    title: changeTitle,
  } = useProcesses();
  const getFullPath = (file: string): string =>
    isAbsolute(file) ? file : join(cd.current, file);
  const commandInterpreter = useCallback(
    async (command: string = ""): Promise<string> => {
      const [baseCommand, ...commandArgs] = parseCommand(command);
      const lcBaseCommand = baseCommand.toLowerCase();

      switch (lcBaseCommand) {
        case "cat":
        case "type": {
          const [file] = commandArgs;

          if (file) {
            const fullPath = getFullPath(file);

            if (await exists(fullPath)) {
              if ((await stat(fullPath)).isDirectory()) {
                localEcho?.println("Access is denied.");
              } else {
                localEcho?.println((await readFile(fullPath)).toString());
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
          const [directory] = commandArgs;

          if (localEcho && directory && lcBaseCommand !== "pwd") {
            const fullPath = getFullPath(directory);

            if (await exists(fullPath)) {
              if (!(await stat(fullPath)).isDirectory()) {
                localEcho?.println("The directory name is invalid.");
              } else if (cd.current !== fullPath) {
                cd.current = fullPath;
                readdir(fullPath).then((files) =>
                  autoComplete(files, localEcho)
                );
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
          terminal?.reset();
          break;
        case "date": {
          localEcho?.println(
            `The current date is: ${getTZOffsetISOString().slice(0, 10)}`
          );
          break;
        }
        case "dir":
        case "ls": {
          const [directory] = commandArgs;

          if (directory) {
            const fullPath = getFullPath(directory);

            if (await exists(fullPath)) {
              if ((await stat(fullPath)).isDirectory()) {
                (await readdir(fullPath)).forEach((entry) =>
                  localEcho?.println(entry)
                );
              } else {
                localEcho?.println(basename(fullPath));
              }
            } else {
              localEcho?.println("File Not Found");
            }
          } else {
            (await readdir(cd.current)).forEach((entry) =>
              localEcho?.println(entry)
            );
          }
          break;
        }
        case "echo":
          localEcho?.println(command.slice(command.indexOf(" ") + 1));
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
          const [processName] = commandArgs;

          if (processes[processName]) {
            closeWithTransition(processName);
            localEcho?.println(
              `SUCCESS: Sent termination signal to the process "${processName}".`
            );
          } else {
            localEcho?.println(
              `ERROR: The process "${processName}" not found.`
            );
          }
          break;
        }
        case "license":
          localEcho?.println(displayLicense);
          break;
        case "ps":
        case "tasklist": {
          printTable(
            [
              ["PID", 25],
              ["Title", 20],
            ],
            Object.entries(processes).map(([pid, { title }]) => [pid, title]),
            localEcho
          );
          break;
        }
        case "py":
        case "python": {
          if (localEcho) {
            await runPython(command.slice(command.indexOf(" ") + 1), localEcho);
          }
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
          changeTitle(id, command.slice(command.indexOf(" ") + 1));
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

            localEcho?.println(
              `Uptime: ${daysOfUptime} days, ${displayUptime}`
            );
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
              const [file] = commandArgs;
              const fullPath = getFullPath(file);

              open(pid, {
                url:
                  file && fullPath && (await exists(fullPath)) ? fullPath : "",
              });
            } else {
              localEcho?.println(unknownCommand(baseCommand));
            }
          }
      }

      return cd.current;
    },
    [
      changeTitle,
      closeWithTransition,
      exists,
      fs,
      id,
      localEcho,
      open,
      processes,
      readFile,
      readdir,
      resetStorage,
      stat,
      terminal,
      updateFolder,
    ]
  );
  const commandInterpreterRef = useRef<CommandInterpreter>(commandInterpreter);

  useEffect(() => {
    commandInterpreterRef.current = commandInterpreter;
  }, [commandInterpreter]);

  return commandInterpreterRef;
};

export default useCommandInterpreter;
