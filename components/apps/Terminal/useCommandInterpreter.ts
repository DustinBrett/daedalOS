import { colorAttributes, rgbAnsi } from "components/apps/Terminal/color";
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
import type { ExtensionType } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import {
  getModifiedTime,
  getProcessByFileExtension,
} from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { basename, dirname, extname, isAbsolute, join } from "path";
import { useCallback, useEffect, useRef } from "react";
import { EMPTY_BUFFER, HOME, ONE_DAY_IN_MILLISECONDS } from "utils/constants";
import { transcode } from "utils/ffmpeg";
import { getTZOffsetISOString } from "utils/functions";
import { convert } from "utils/imagemagick";
import { fullSearch } from "utils/search";
import type { Terminal } from "xterm";

const FILE_NOT_FILE = "The system cannot find the file specified.";
const PATH_NOT_FOUND = "The system cannot find the path specified.";
const SYNTAX_ERROR = "The syntax of the command is incorrect.";

const useCommandInterpreter = (
  id: string,
  terminal?: Terminal,
  localEcho?: LocalEcho
): React.MutableRefObject<CommandInterpreter> => {
  const cd = useRef(HOME);
  const {
    deletePath,
    exists,
    fs,
    mkdirRecursive,
    readdir,
    readFile,
    rename,
    resetStorage,
    rootFs,
    stat,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const {
    closeWithTransition,
    open,
    processes,
    title: changeTitle,
  } = useProcesses();
  const getFullPath = (file: string): string => {
    if (!file) return "";

    return isAbsolute(file) ? file : join(cd.current, file);
  };
  const colorOutput = useRef<string[]>([]);
  const updateFile = useCallback(
    (filePath: string, isDeleted = false): void => {
      const dirPath = dirname(filePath);

      if (isDeleted) {
        updateFolder(dirPath, undefined, basename(filePath));
      } else {
        updateFolder(dirPath, basename(filePath));
      }

      if (dirPath === cd.current && localEcho) {
        readdir(dirPath).then((files) => autoComplete(files, localEcho));
      }
    },
    [localEcho, readdir, updateFolder]
  );
  const commandInterpreter = useCallback(
    async (command: string = ""): Promise<string> => {
      const [baseCommand = "", ...commandArgs] = parseCommand(command);
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
              localEcho?.println(PATH_NOT_FOUND);
            }
          } else {
            localEcho?.println(SYNTAX_ERROR);
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
              localEcho?.println(PATH_NOT_FOUND);
            }
          } else {
            localEcho?.println(cd.current);
          }
          break;
        }
        case "color": {
          const [r, g, b] = commandArgs;

          if (
            typeof r !== "undefined" &&
            typeof g !== "undefined" &&
            typeof b !== "undefined"
          ) {
            localEcho?.print(rgbAnsi(Number(r), Number(g), Number(b)));
          } else {
            const [[bg, fg] = []] = commandArgs;
            const { rgb: bgRgb, name: bgName } =
              colorAttributes[bg?.toUpperCase()] || {};
            const { rgb: fgRgb, name: fgName } =
              colorAttributes[fg?.toUpperCase()] || {};

            if (bgRgb) {
              const useAsBg = Boolean(fgRgb);
              const bgAnsi = rgbAnsi(...bgRgb, useAsBg);

              localEcho?.print(bgAnsi);
              localEcho?.println(
                `${useAsBg ? "Background" : "Foreground"}: ${bgName}`
              );
              colorOutput.current[0] = bgAnsi;
            }

            if (fgRgb) {
              const fgAnsi = rgbAnsi(...fgRgb);

              localEcho?.print(fgAnsi);
              localEcho?.println(`Foreground: ${fgName}`);
              colorOutput.current[1] = fgAnsi;
            }

            if (!fgRgb && !bgRgb) {
              localEcho?.print("\u001B[0m");
              colorOutput.current = [];
            }
          }
          break;
        }
        case "copy":
        case "cp": {
          const [source, destination] = commandArgs;
          const fullSourcePath = getFullPath(source);

          if (await exists(fullSourcePath)) {
            if (destination) {
              const fullDestinationPath = getFullPath(destination);

              await writeFile(
                fullDestinationPath,
                await readFile(fullSourcePath)
              );
              localEcho?.println("\t1 file(s) copied.");
              updateFile(fullDestinationPath);
            } else {
              localEcho?.println("The file cannot be copied onto itself.");
              localEcho?.println("\t0 file(s) copied.");
            }
          } else {
            localEcho?.println(FILE_NOT_FILE);
          }
          break;
        }
        case "clear":
        case "cls":
          terminal?.reset();
          terminal?.write(`\u001Bc${colorOutput.current.join("")}`);
          break;
        case "date": {
          localEcho?.println(
            `The current date is: ${getTZOffsetISOString().slice(0, 10)}`
          );
          break;
        }
        case "del":
        case "rd":
        case "rm":
        case "rmdir": {
          const [commandPath] = commandArgs;

          if (commandPath) {
            const fullPath = getFullPath(commandPath);

            if (await exists(fullPath)) {
              await deletePath(fullPath);
              updateFile(fullPath, true);
            }
          }
          break;
        }
        case "dir":
        case "ls": {
          const [directory] = commandArgs;
          const listDir = async (dirPath: string): Promise<void> => {
            let totalSize = 0;
            let fileCount = 0;
            let directoryCount = 0;
            const entries = await readdir(dirPath);
            const entriesWithStats = await Promise.all(
              entries.map(async (entry) => {
                const filePath = join(dirPath, entry);
                const fileStats = await stat(filePath);
                const mDate = new Date(getModifiedTime(filePath, fileStats));
                const date = mDate.toISOString().slice(0, 10);
                const time = new Intl.DateTimeFormat("en-US", {
                  timeStyle: "short",
                })
                  .format(mDate)
                  .padStart(8, "0");
                const isDirectory = fileStats.isDirectory();

                totalSize += fileStats.size;
                if (isDirectory) {
                  directoryCount += 1;
                } else {
                  fileCount += 1;
                }

                return [
                  `${date}  ${time}`,
                  isDirectory
                    ? "<DIR>        "
                    : fileStats.size.toLocaleString(),
                  entry,
                ];
              })
            );
            localEcho?.println(` Directory of ${dirPath}`);
            localEcho?.println("");
            printTable(
              [
                ["Date", 22],
                ["Type/Size", 15, true],
                ["Name", terminal?.cols ? terminal.cols - 40 : 30],
              ],
              entriesWithStats,
              localEcho,
              true
            );
            localEcho?.println(
              `\t\t${fileCount} File(s) ${totalSize.toLocaleString()} bytes`
            );
            localEcho?.println(`\t\t${directoryCount} Dir(s)`);
          };

          if (directory) {
            const fullPath = getFullPath(directory);

            if (await exists(fullPath)) {
              if ((await stat(fullPath)).isDirectory()) {
                await listDir(fullPath);
              } else {
                localEcho?.println(basename(fullPath));
              }
            } else {
              localEcho?.println("File Not Found");
            }
          } else {
            await listDir(cd.current);
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
        case "find": {
          const results = await fullSearch(
            commandArgs.join(" "),
            readFile,
            rootFs
          );
          results?.forEach(({ ref }) => localEcho?.println(ref));
          break;
        }
        case "ffmpeg":
        case "imagemagick": {
          const [file, format] = commandArgs;

          if (file && format) {
            const fullPath = getFullPath(file);

            if (
              (await exists(fullPath)) &&
              !(await stat(fullPath)).isDirectory()
            ) {
              const convertOrTranscode =
                lcBaseCommand === "ffmpeg" ? transcode : convert;
              const [[newName, newData]] = await convertOrTranscode(
                [[basename(fullPath), await readFile(fullPath)]],
                format,
                localEcho
              );

              if (newName && newData) {
                const newPath = join(dirname(fullPath), newName);

                await writeFile(newPath, newData);
                updateFile(newPath);
              }
            } else {
              localEcho?.println(FILE_NOT_FILE);
            }
          } else {
            localEcho?.println(SYNTAX_ERROR);
          }
          break;
        }
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
        case "help": {
          const [commandName] = commandArgs;

          if (localEcho) {
            if (commandName) {
              const helpCommand = commands[commandName]
                ? commandName
                : Object.entries(aliases).find(
                    ([, [baseCommandName]]) => baseCommandName === commandName
                  )?.[0];

              if (helpCommand && commands[helpCommand]) {
                localEcho.println(commands[helpCommand]);
              } else {
                localEcho.println(
                  "This command is not supported by the help utility."
                );
              }
            } else {
              help(localEcho, commands, aliases);
            }
          }
          break;
        }
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
        case "md":
        case "mkdir": {
          const [directory] = commandArgs;

          if (directory) {
            const fullPath = getFullPath(directory);

            await mkdirRecursive(fullPath);
            updateFile(fullPath);
          }
          break;
        }
        case "move":
        case "mv":
        case "ren":
        case "rename": {
          const [source, destination] = commandArgs;
          const fullSourcePath = getFullPath(source);

          if (await exists(fullSourcePath)) {
            if (destination) {
              const fullDestinationPath = getFullPath(destination);

              await rename(fullSourcePath, fullDestinationPath);
              updateFile(fullSourcePath, true);
              updateFile(fullDestinationPath);
            } else {
              localEcho?.println(SYNTAX_ERROR);
            }
          } else {
            localEcho?.println(FILE_NOT_FILE);
          }
          break;
        }
        case "ps":
        case "tasklist": {
          printTable(
            [
              ["PID", 30],
              ["Title", 25],
            ],
            Object.entries(processes).map(([pid, { title }]) => [pid, title]),
            localEcho
          );
          break;
        }
        case "py":
        case "python": {
          if (localEcho) {
            const [file] = commandArgs;
            const fullSourcePath = getFullPath(file);

            if (await exists(fullSourcePath)) {
              const code = await readFile(fullSourcePath);

              await runPython(code.toString(), localEcho);
            } else {
              await runPython(
                command.slice(command.indexOf(" ") + 1),
                localEcho
              );
            }
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
        case "touch": {
          const [file] = commandArgs;

          if (file) {
            const fullPath = getFullPath(file);

            await writeFile(fullPath, EMPTY_BUFFER);
            updateFile(fullPath);
          }
          break;
        }
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
            } else if (await exists(baseCommand)) {
              const fileExtension = extname(
                baseCommand
              ).toLowerCase() as ExtensionType;

              if (
                extensions[fileExtension]?.process.includes("Terminal") &&
                extensions[fileExtension]?.command
              ) {
                await commandInterpreter(
                  `${extensions[fileExtension].command} ${baseCommand}`
                );
              } else {
                const basePid = getProcessByFileExtension(fileExtension);

                if (basePid) open(basePid, { url: baseCommand });
              }
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
      deletePath,
      exists,
      fs,
      id,
      localEcho,
      mkdirRecursive,
      open,
      processes,
      readFile,
      readdir,
      rename,
      resetStorage,
      rootFs,
      stat,
      terminal,
      updateFile,
      updateFolder,
      writeFile,
    ]
  );
  const commandInterpreterRef = useRef<CommandInterpreter>(commandInterpreter);

  useEffect(() => {
    commandInterpreterRef.current = commandInterpreter;
  }, [commandInterpreter]);

  return commandInterpreterRef;
};

export default useCommandInterpreter;
