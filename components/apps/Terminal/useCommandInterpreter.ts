import { colorAttributes, rgbAnsi } from "components/apps/Terminal/color";
import {
  BACKUP_NAME_SERVER,
  PI_ASCII,
  PRIMARY_NAME_SERVER,
  config,
} from "components/apps/Terminal/config";
import {
  aliases,
  autoComplete,
  commands,
  getFreeSpace,
  getUptime,
  help,
  parseCommand,
  printColor,
  printTable,
  unknownCommand,
} from "components/apps/Terminal/functions";
import loadWapm from "components/apps/Terminal/loadWapm";
import processGit from "components/apps/Terminal/processGit";
import { runPython } from "components/apps/Terminal/python";
import type {
  CommandInterpreter,
  LocalEcho,
  NsEntry,
  NsResponse,
} from "components/apps/Terminal/types";
import {
  displayLicense,
  displayVersion,
} from "components/apps/Terminal/useTerminal";
import { resourceAliasMap } from "components/system/Dialogs/Run";
import extensions from "components/system/Files/FileEntry/extensions";
import {
  getModifiedTime,
  getProcessByFileExtension,
  getShortcutInfo,
} from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { requestPermission, resetStorage } from "contexts/fileSystem/functions";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useProcessesRef } from "hooks/useProcessesRef";
import { basename, dirname, extname, isAbsolute, join } from "path";
import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import type UAParser from "ua-parser-js";
import {
  DEFAULT_LOCALE,
  DESKTOP_PATH,
  HIGH_PRIORITY_REQUEST,
  MILLISECONDS_IN_SECOND,
  PACKAGE_DATA,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import { transcode } from "utils/ffmpeg";
import {
  getExtension,
  getTZOffsetISOString,
  isFileSystemMappingSupported,
  loadFiles,
} from "utils/functions";
import { convert } from "utils/imagemagick";
import { getIpfsFileName, getIpfsResource } from "utils/ipfs";
import { fullSearch } from "utils/search";
import { convertSheet } from "utils/sheetjs";
import type { Terminal } from "xterm";

const COMMAND_NOT_SUPPORTED = "The system does not support the command.";
const FILE_NOT_FILE = "The system cannot find the file specified.";
const PATH_NOT_FOUND = "The system cannot find the path specified.";
const SYNTAX_ERROR = "The syntax of the command is incorrect.";

const { alias } = PACKAGE_DATA;

type WindowPerformance = Performance & {
  memory: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
  };
};

type IResultWithGPU = UAParser.IResult & { gpu: UAParser.IDevice };

declare global {
  interface Window {
    UAParser: UAParser;
  }
}

const useCommandInterpreter = (
  id: string,
  cd: React.MutableRefObject<string>,
  terminal?: Terminal,
  localEcho?: LocalEcho
): React.MutableRefObject<CommandInterpreter> => {
  const {
    createPath,
    deletePath,
    exists,
    fs,
    lstat,
    mapFs,
    mkdirRecursive,
    readdir,
    readFile,
    rename,
    rootFs,
    stat,
    updateFolder,
  } = useFileSystem();
  const { closeWithTransition, open, title: changeTitle } = useProcesses();
  const processesRef = useProcessesRef();
  const { name: themeName } = useTheme();
  const getFullPath = useCallback(
    async (file: string, writePath?: string): Promise<string> => {
      if (!file) return "";

      if (file.startsWith("ipfs://")) {
        const ipfsData = await getIpfsResource(file);
        const ipfsFile = join(
          DESKTOP_PATH,
          await createPath(
            await getIpfsFileName(file, ipfsData),
            writePath || DESKTOP_PATH,
            ipfsData
          )
        );

        updateFolder(writePath || DESKTOP_PATH, basename(ipfsFile));

        return ipfsFile;
      }

      return isAbsolute(file) ? file : join(cd.current, file);
    },
    [cd, createPath, updateFolder]
  );
  const colorOutput = useRef<string[]>([]);
  const updateFile = useCallback(
    (filePath: string, isDeleted = false): void => {
      const dirPath = dirname(filePath);

      if (isDeleted) {
        updateFolder(dirPath, undefined, basename(filePath));
      } else {
        updateFolder(dirPath, basename(filePath));
      }
    },
    [updateFolder]
  );
  const commandInterpreter = useCallback(
    async (command = ""): Promise<string> => {
      const [baseCommand = "", ...commandArgs] = parseCommand(command);
      const lcBaseCommand = baseCommand.toLowerCase();

      // eslint-disable-next-line sonarjs/max-switch-cases
      switch (lcBaseCommand) {
        case "cat":
        case "type": {
          const [file] = commandArgs;

          if (file) {
            const fullPath = await getFullPath(file);

            if (await exists(fullPath)) {
              if ((await lstat(fullPath)).isDirectory()) {
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
        case "cd/":
        case "cd.":
        case "cd..":
        case "chdir":
        case "pwd": {
          const [directory] =
            lcBaseCommand.startsWith("cd") && lcBaseCommand.length > 2
              ? [lcBaseCommand.slice(2)]
              : commandArgs;

          if (directory && lcBaseCommand !== "pwd") {
            const fullPath = await getFullPath(directory);

            if (await exists(fullPath)) {
              if (!(await lstat(fullPath)).isDirectory()) {
                localEcho?.println("The directory name is invalid.");
              } else if (cd.current !== fullPath && localEcho) {
                // eslint-disable-next-line no-param-reassign
                cd.current = fullPath;
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

          if (r !== undefined && g !== undefined && b !== undefined) {
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
          const fullSourcePath = await getFullPath(source);

          if (await exists(fullSourcePath)) {
            if (destination) {
              const fullDestinationPath = await getFullPath(destination);
              const dirName = dirname(fullDestinationPath);

              updateFile(
                join(
                  dirName,
                  await createPath(
                    basename(fullDestinationPath),
                    dirName,
                    await readFile(fullSourcePath)
                  )
                )
              );
              localEcho?.println("\t1 file(s) copied.");
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
        case "date":
          localEcho?.println(
            `The current date is: ${getTZOffsetISOString().slice(0, 10)}`
          );
          break;
        case "del":
        case "erase":
        case "rd":
        case "rm":
        case "rmdir": {
          const [commandPath] = commandArgs;

          if (commandPath) {
            const fullPath = await getFullPath(commandPath);

            if ((await exists(fullPath)) && (await deletePath(fullPath))) {
              updateFile(fullPath, true);
            }
          }
          break;
        }
        case "dir":
        case "ls": {
          const [directory = ""] = commandArgs;
          const listDir = async (dirPath: string): Promise<void> => {
            let totalSize = 0;
            let fileCount = 0;
            let directoryCount = 0;
            let entries = await readdir(dirPath);

            if (
              entries.length === 0 &&
              rootFs?.mntMap[dirPath]?.getName() === "FileSystemAccess"
            ) {
              await requestPermission(dirPath);
              entries = await readdir(dirPath);
            }

            const timeFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
              timeStyle: "short",
            });
            const entriesWithStats = await Promise.all(
              entries
                .filter(
                  (entry) =>
                    (!directory.startsWith("*") ||
                      entry.endsWith(directory.slice(1))) &&
                    (!directory.endsWith("*") ||
                      entry.startsWith(directory.slice(0, -1)))
                )
                .map(async (entry) => {
                  const filePath = join(dirPath, entry);
                  const fileStats = await stat(filePath);
                  const mDate = new Date(getModifiedTime(filePath, fileStats));
                  const date = mDate.toISOString().slice(0, 10);
                  const time = timeFormatter.format(mDate).padStart(8, "0");
                  const isDirectory = fileStats.isDirectory();

                  totalSize += isDirectory ? 0 : fileStats.size;
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

            const fullSizeTerminal =
              !localEcho?._termSize?.cols || localEcho?._termSize?.cols > 52;

            printTable(
              [
                ["Date", fullSizeTerminal ? 22 : 20],
                [
                  "Type/Size",
                  fullSizeTerminal ? 15 : 13,
                  true,
                  (size) => (size === "-1" ? "" : size),
                ],
                ["Name", terminal?.cols ? terminal.cols - 40 : 30],
              ],
              entriesWithStats,
              localEcho,
              true
            );
            localEcho?.println(
              `\t\t${fileCount} File(s)\t${totalSize.toLocaleString()} bytes`
            );
            localEcho?.println(
              `\t\t${directoryCount} Dir(s)${await getFreeSpace()}`
            );
          };

          if (
            directory &&
            !directory.startsWith("*") &&
            !directory.endsWith("*")
          ) {
            const fullPath = await getFullPath(directory);

            if (await exists(fullPath)) {
              if ((await lstat(fullPath)).isDirectory()) {
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
        case "file": {
          const [commandPath] = commandArgs;

          if (commandPath) {
            const fullPath = await getFullPath(commandPath);

            if (await exists(fullPath)) {
              const { fileTypeFromBuffer } = await import("file-type");
              const { mime = "Unknown" } =
                (await fileTypeFromBuffer(await readFile(fullPath))) || {};

              localEcho?.println(`${commandPath}: ${mime}`);
            }
          }
          break;
        }
        case "find":
        case "search": {
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
            const fullPath = await getFullPath(file);

            if (
              (await exists(fullPath)) &&
              !(await lstat(fullPath)).isDirectory()
            ) {
              const convertOrTranscode =
                lcBaseCommand === "ffmpeg" ? transcode : convert;
              const [[newName, newData]] = await convertOrTranscode(
                [[basename(fullPath), await readFile(fullPath)]],
                format,
                localEcho
              );

              if (newName && newData) {
                const dirName = dirname(fullPath);

                updateFile(
                  join(dirName, await createPath(newName, dirName, newData))
                );
              }
            } else {
              localEcho?.println(FILE_NOT_FILE);
            }
          } else {
            localEcho?.println(SYNTAX_ERROR);
          }
          break;
        }
        case "git":
        case "isogit":
          if (fs && localEcho) {
            await processGit(
              commandArgs,
              cd.current,
              localEcho,
              fs,
              updateFolder
            );
          }
          break;
        case "help": {
          const [commandName] = commandArgs;

          if (localEcho) {
            const showAliases = commandName === "-a";

            if (commandName && !showAliases) {
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
              help(localEcho, commands, showAliases ? aliases : undefined);
            }
          }
          break;
        }
        case "history":
          localEcho?.history.entries.forEach((entry, index) =>
            localEcho.println(`${(index + 1).toString().padStart(4)} ${entry}`)
          );
          break;
        case "ipfs": {
          const [commandName, cid] = commandArgs;

          if (commandName === "get" && cid) {
            await getFullPath(`ipfs://${cid}`, cd.current);
          }

          break;
        }
        case "ifconfig":
        case "ipconfig":
        case "whatsmyip": {
          const cloudFlareIpTraceText =
            (await (
              await fetch("https://cloudflare.com/cdn-cgi/trace")
            ).text()) || "";
          const { ip = "" } = Object.fromEntries(
            cloudFlareIpTraceText
              .trim()
              .split("\n")
              .map((entry) => entry.split("=")) || []
          ) as Record<string, string>;
          const isValidIp = (possibleIp: string): boolean => {
            const octets = possibleIp.split(".");

            return (
              octets.length === 4 &&
              octets.map(Number).every((octet) => octet > 0 && octet < 256)
            );
          };

          localEcho?.println("IP Configuration");
          localEcho?.println("");
          localEcho?.println(
            `   IPv4 Address. . . . . . . . . . . : ${
              isValidIp(ip) ? ip : "Unknown"
            }`
          );
          break;
        }
        case "kill":
        case "taskkill": {
          const [processId] = commandArgs;
          const processName =
            Number.isNaN(processId) || processesRef.current[processId]
              ? processId
              : Object.keys(processesRef.current)[Number(processId)];

          if (processesRef.current[processName]) {
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
            const fullPath = await getFullPath(directory);

            await mkdirRecursive(fullPath);
            updateFile(fullPath);
          }
          break;
        }
        case "mount":
          if (localEcho) {
            if (isFileSystemMappingSupported()) {
              try {
                const mappedFolder = await mapFs(cd.current);

                if (mappedFolder) {
                  const fullPath = join(cd.current, mappedFolder);

                  updateFolder(cd.current, mappedFolder);

                  // eslint-disable-next-line no-param-reassign
                  cd.current = fullPath;
                }
              } catch {
                // Ignore failure to mount
              }
            } else {
              localEcho?.println(COMMAND_NOT_SUPPORTED);
            }
          }
          break;
        case "move":
        case "mv":
        case "ren":
        case "rename": {
          const [source, destination] = commandArgs;
          const fullSourcePath = await getFullPath(source);

          if (await exists(fullSourcePath)) {
            if (destination) {
              let fullDestinationPath = await getFullPath(destination);

              if (
                ["move", "mv"].includes(lcBaseCommand) &&
                (await stat(fullDestinationPath)).isDirectory()
              ) {
                fullDestinationPath = join(
                  fullDestinationPath,
                  basename(fullSourcePath)
                );
              }

              if (await rename(fullSourcePath, fullDestinationPath)) {
                updateFile(fullSourcePath, true);
                updateFile(fullDestinationPath);
              }
            } else {
              localEcho?.println(SYNTAX_ERROR);
            }
          } else {
            localEcho?.println(FILE_NOT_FILE);
          }
          break;
        }
        case "neofetch":
        case "systeminfo": {
          await loadFiles(["/Program Files/Xterm.js/ua-parser.js"]);

          const {
            browser,
            cpu,
            engine,
            gpu,
            os: hostOS,
          } = (new window.UAParser().getResult() || {}) as IResultWithGPU;
          const { cols, options } = terminal || {};
          const userId = `public@${window.location.hostname}`;
          const terminalFont = (options?.fontFamily || config.fontFamily)
            ?.split(", ")
            .find((font) =>
              document.fonts.check(
                `${options?.fontSize || config.fontSize || 12}px ${font}`
              )
            );
          const { quota = 0, usage = 0 } =
            (await navigator.storage?.estimate?.()) || {};
          const labelColor = 3;
          const labelText = (text: string): string =>
            `${rgbAnsi(...colorAttributes[labelColor].rgb)}${text}${
              colorOutput.current?.[0] || rgbAnsi(...colorAttributes[7].rgb)
            }`;
          const output = [
            userId,
            Array.from({ length: userId.length }).fill("-").join(""),
            `OS: ${alias} ${displayVersion()}`,
          ];

          if (hostOS?.name) {
            output.push(
              `Host: ${hostOS.name}${
                hostOS?.version ? ` ${hostOS.version}` : ""
              }${cpu?.architecture ? ` ${cpu?.architecture}` : ""}`
            );
          }

          if (browser?.name) {
            output.push(
              `Kernel: ${browser.name}${
                browser?.version ? ` ${browser.version}` : ""
              }${engine?.name ? ` (${engine.name})` : ""}`
            );
          }

          output.push(
            `Uptime: ${getUptime(true)}`,
            `Packages: ${Object.keys(processDirectory).length}`,
            `Resolution: ${window.screen.width}x${window.screen.height}`,
            `Theme: ${themeName}`
          );

          if (terminalFont) {
            output.push(`Terminal Font: ${terminalFont}`);
          }

          if (gpu?.vendor) {
            output.push(
              `GPU: ${gpu.vendor}${gpu?.model ? ` ${gpu.model}` : ""}`
            );
          } else if (gpu?.model) {
            output.push(`GPU: ${gpu.model}`);
          }

          if (window.performance && "memory" in window.performance) {
            output.push(
              `Memory: ${(
                (window.performance as WindowPerformance).memory
                  .totalJSHeapSize /
                1024 /
                1024
              ).toFixed(0)}MB / ${(
                (window.performance as WindowPerformance).memory
                  .jsHeapSizeLimit /
                1024 /
                1024
              ).toFixed(0)}MB`
            );
          }

          if (quota) {
            output.push(
              `Disk (/): ${(usage / 1024 / 1024 / 1024).toFixed(0)}G / ${(
                quota /
                1024 /
                1024 /
                1024
              ).toFixed(0)}G (${((usage / quota) * 100).toFixed(2)}%)`
            );
          }

          const longestLineLength = output.reduce(
            (max, line) => Math.max(max, line.length),
            0
          );
          const maxCols = cols || config.cols || 70;

          if (localEcho) {
            const longestLine = PI_ASCII[0].length + longestLineLength;
            const imgPadding = Math.max(Math.min(maxCols - longestLine, 3), 1);

            output.push(
              "\n",
              [0, 4, 2, 6, 1, 5, 3, 7]
                .map((color) => printColor(color, colorOutput.current))
                .join(""),
              [8, "C", "A", "E", 9, "D", "B", "F"]
                .map((color) => printColor(color, colorOutput.current))
                .join("")
            );
            PI_ASCII.forEach((imgLine, lineIndex) => {
              let outputLine = output[lineIndex] || "";

              if (lineIndex === 0) {
                const [user, system] = outputLine.split("@");

                outputLine = `${labelText(user)}@${labelText(system)}`;
              } else {
                const [label, info] = outputLine.split(":");

                if (info) {
                  outputLine = `${labelText(label)}:${info}`;
                }
              }

              localEcho.println(
                `${labelText(imgLine)}${
                  outputLine.padStart(outputLine.length + imgPadding, " ") || ""
                }`
              );
            });
          }
          break;
        }
        case "nslookup": {
          const [domainName] = commandArgs;

          if (domainName) {
            const nsLookup = async (
              domain: string,
              server = PRIMARY_NAME_SERVER[0]
            ): Promise<NsEntry[]> => {
              const { Answer = [] } = (await (
                await fetch(`${server}?name=${domain}`, {
                  headers: { Accept: "application/dns-json" },
                })
              ).json()) as NsResponse;

              return Answer;
            };
            let answer: NsEntry[] | undefined;
            let primaryFailed = false;

            try {
              answer = await nsLookup(domainName);
            } catch {
              try {
                primaryFailed = true;
                answer = await nsLookup(domainName, BACKUP_NAME_SERVER[0]);
              } catch {
                // Ignore failure on backup name server
              }
            }

            if (answer) {
              const [server, address] = primaryFailed
                ? BACKUP_NAME_SERVER
                : PRIMARY_NAME_SERVER;
              const { host } = new URL(server);

              localEcho?.println(`Server:  ${host}`);
              localEcho?.println(`Address:  ${address}`);
              localEcho?.println("");
              localEcho?.println("Non-authoritative answer:");
              localEcho?.println(`Name:    ${domainName}`);
              localEcho?.println(
                `Addresses:  ${answer
                  .map(({ data }) => data)
                  .join("\n          ")}`
              );
              localEcho?.println("");
            } else {
              localEcho?.println("Failed to contact name servers.");
            }
          }
          break;
        }
        case "sheep":
        case "esheep": {
          const { default: spawnSheep } = await import("utils/spawnSheep");
          let [count = 1, duration = 0] = commandArgs;

          if (!Number.isNaN(count) && !Number.isNaN(duration)) {
            count = Number(count);
            duration = Number(duration);

            if (count > 1) {
              await spawnSheep();
              count -= 1;
            }

            const maxDuration =
              (duration || (count > 1 ? 1 : 0)) * MILLISECONDS_IN_SECOND;

            Array.from({ length: count })
              .fill(0)
              .map(() => Math.floor(Math.random() * maxDuration))
              .forEach((delay) => setTimeout(spawnSheep, delay));
          }
          break;
        }
        case "ps":
        case "tasklist":
          printTable(
            [
              ["Image Name", 25],
              ["PID", 8],
              ["Title", 16],
            ],
            Object.entries(processesRef.current).map(
              ([pid, { title }], index) => [pid, index.toString(), title]
            ),
            localEcho
          );
          break;
        case "py":
        case "python":
          if (localEcho) {
            const [file] = commandArgs;
            const fullSourcePath = await getFullPath(file);

            if (await exists(fullSourcePath)) {
              const code = await readFile(fullSourcePath);

              if (code.length > 0) {
                await runPython(code.toString(), localEcho);
              }
            } else {
              const [, code = "version"] = command.split(" ");

              await runPython(code, localEcho);
            }
          }
          break;
        case "logout":
        case "restart":
        case "shutdown":
          resetStorage(rootFs).finally(() => window.location.reload());
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
            const fullPath = await getFullPath(file);
            const dirName = dirname(fullPath);

            updateFile(
              join(
                dirName,
                await createPath(basename(fullPath), dirName, Buffer.from(""))
              )
            );
          }
          break;
        }
        case "uptime":
          localEcho?.println(`Uptime: ${getUptime()}`);
          break;
        case "ver":
        case "version":
          localEcho?.println(displayVersion());
          break;
        case "wapm":
        case "wax": {
          if (!localEcho) break;

          const [file] = commandArgs;
          const fullSourcePath = await getFullPath(file);

          await loadWapm(
            commandArgs,
            localEcho,
            fullSourcePath.endsWith(".wasm") && (await exists(fullSourcePath))
              ? await readFile(fullSourcePath)
              : undefined
          );

          break;
        }
        case "weather":
        case "wttr": {
          const response = await fetch(
            "https://wttr.in/?1nAF",
            HIGH_PRIORITY_REQUEST
          );

          localEcho?.println(await response.text());

          const [bgAnsi, fgAnsi] = colorOutput.current;

          if (bgAnsi) localEcho?.print(bgAnsi);
          if (fgAnsi) localEcho?.print(fgAnsi);
          break;
        }
        case "whoami":
          localEcho?.println(`${window.location.hostname}\\public`);
          break;
        case "xlsx": {
          const [file, format = "xlsx"] = commandArgs;

          if (file && format) {
            const fullPath = await getFullPath(file);

            if (
              (await exists(fullPath)) &&
              !(await lstat(fullPath)).isDirectory()
            ) {
              const workBook = await convertSheet(
                await readFile(fullPath),
                format
              );
              const dirName = dirname(fullPath);

              updateFile(
                join(
                  dirName,
                  await createPath(
                    `${basename(file, extname(file))}.${format}`,
                    dirName,
                    Buffer.from(workBook)
                  )
                )
              );
            } else {
              localEcho?.println(FILE_NOT_FILE);
            }
          } else {
            localEcho?.println(SYNTAX_ERROR);
          }
          break;
        }
        default:
          if (baseCommand) {
            const pid =
              Object.keys(processDirectory).find(
                (process) => process.toLowerCase() === lcBaseCommand
              ) || resourceAliasMap[lcBaseCommand];

            if (pid) {
              const [file] = commandArgs;
              const fullPath = await getFullPath(file);

              open(pid, {
                url:
                  file && fullPath && (await exists(fullPath)) ? fullPath : "",
              });
            } else {
              const baseFileExists = await exists(baseCommand);

              if (
                baseFileExists ||
                (await exists(join(cd.current, baseCommand)))
              ) {
                const fileExtension = getExtension(baseCommand);
                const { command: extCommand = "" } =
                  extensions[fileExtension] || {};

                if (extCommand) {
                  await commandInterpreter(
                    `${extCommand} ${baseCommand}${
                      commandArgs.length > 0 ? ` ${commandArgs.join(" ")}` : ""
                    }`
                  );
                } else {
                  const fullFilePath = baseFileExists
                    ? baseCommand
                    : join(cd.current, baseCommand);
                  let basePid = "";
                  let baseUrl = fullFilePath;

                  if (fileExtension === SHORTCUT_EXTENSION) {
                    ({ pid: basePid, url: baseUrl } = getShortcutInfo(
                      await readFile(fullFilePath)
                    ));
                  } else {
                    basePid = getProcessByFileExtension(fileExtension);
                  }

                  if (basePid) open(basePid, { url: baseUrl });
                }
              } else {
                localEcho?.println(unknownCommand(baseCommand));
              }
            }
          }
      }

      if (localEcho) {
        readdir(cd.current).then((files) => autoComplete(files, localEcho));
      }

      return cd.current;
    },
    [
      cd,
      changeTitle,
      closeWithTransition,
      createPath,
      deletePath,
      exists,
      fs,
      getFullPath,
      id,
      localEcho,
      lstat,
      mapFs,
      mkdirRecursive,
      open,
      processesRef,
      readFile,
      readdir,
      rename,
      rootFs,
      stat,
      terminal,
      themeName,
      updateFile,
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
