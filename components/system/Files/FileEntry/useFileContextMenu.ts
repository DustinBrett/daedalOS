import extensions, {
  TEXT_EDITORS,
} from "components/system/Files/FileEntry/extensions";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import useFile from "components/system/Files/FileEntry/useFile";
import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import type { FileActions } from "components/system/Files/FileManager/useFolder";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import type {
  ContextMenuCapture,
  MenuItem,
} from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { basename, dirname, extname, join } from "path";
import { useMemo } from "react";
import {
  AUDIO_PLAYLIST_EXTENSIONS,
  DESKTOP_PATH,
  EDITABLE_IMAGE_FILE_EXTENSIONS,
  EXTRACTABLE_EXTENSIONS,
  IMAGE_FILE_EXTENSIONS,
  isFileSystemSupported,
  MENU_SEPERATOR,
  MOUNTABLE_EXTENSIONS,
  ROOT_SHORTCUT,
  SHORTCUT_EXTENSION,
  SPREADSHEET_FORMATS,
} from "utils/constants";
import {
  AUDIO_DECODE_FORMATS,
  AUDIO_ENCODE_FORMATS,
  VIDEO_DECODE_FORMATS,
  VIDEO_ENCODE_FORMATS,
} from "utils/ffmpeg/formats";
import type { FFmpegTranscodeFile } from "utils/ffmpeg/types";
import {
  IMAGE_DECODE_FORMATS,
  IMAGE_ENCODE_FORMATS,
} from "utils/imagemagick/formats";
import type { ImageMagickConvertFile } from "utils/imagemagick/types";
import type { URLTrack } from "webamp";

const useFileContextMenu = (
  url: string,
  pid: string,
  path: string,
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  {
    archiveFiles,
    deleteLocalPath,
    downloadFiles,
    extractFiles,
    newShortcut,
  }: FileActions,
  { blurEntry, focusEntry }: FocusEntryFunctions,
  focusedEntries: string[],
  fileManagerId?: string,
  readOnly?: boolean
): ContextMenuCapture => {
  const { open, url: changeUrl } = useProcesses();
  const { setWallpaper } = useSession();
  const baseName = basename(path);
  const isFocusedEntry = focusedEntries.includes(baseName);
  const openFile = useFile(url);
  const {
    copyEntries,
    createPath,
    lstat,
    mapFs,
    moveEntries,
    readFile,
    rootFs,
    unMapFs,
    updateFolder,
  } = useFileSystem();
  const { contextMenu } = useMenu();
  const { onContextMenuCapture, ...contextMenuHandlers } = useMemo(
    () =>
      contextMenu?.(() => {
        const urlExtension = extname(url).toLowerCase();
        const { process: extensionProcesses = [] } =
          urlExtension in extensions ? extensions[urlExtension] : {};
        const openWith = extensionProcesses.filter(
          (process) => process !== pid
        );
        const openWithFiltered = openWith.filter((id) => id !== pid);
        const absoluteEntries = (): string[] =>
          focusedEntries.length === 1 || !isFocusedEntry
            ? [path]
            : [
                ...new Set([
                  path,
                  ...focusedEntries.map((entry) => join(dirname(path), entry)),
                ]),
              ];
        const menuItems: MenuItem[] = [];
        const pathExtension = extname(path).toLowerCase();
        const isShortcut = pathExtension === SHORTCUT_EXTENSION;
        const remoteMount = rootFs?.mountList.some(
          (mountPath) =>
            mountPath === path &&
            rootFs?.mntMap[mountPath]?.getName() === "FileSystemAccess"
        );

        if (!readOnly && !remoteMount) {
          const defaultProcess = getProcessByFileExtension(urlExtension);

          menuItems.push(
            { action: () => moveEntries(absoluteEntries()), label: "Cut" },
            { action: () => copyEntries(absoluteEntries()), label: "Copy" },
            MENU_SEPERATOR
          );

          if (
            defaultProcess ||
            isShortcut ||
            (!pathExtension && !urlExtension)
          ) {
            menuItems.push({
              action: () =>
                absoluteEntries().forEach(async (entry) => {
                  const shortcutProcess =
                    defaultProcess && !(await lstat(entry)).isDirectory()
                      ? defaultProcess
                      : "FileExplorer";

                  newShortcut(entry, shortcutProcess);
                }),
              label: "Create shortcut",
            });
          }

          menuItems.push(
            {
              action: () =>
                absoluteEntries().forEach((entry) => deleteLocalPath(entry)),
              label: "Delete",
            },
            { action: () => setRenaming(baseName), label: "Rename" }
          );

          if (path) {
            if (path === join(DESKTOP_PATH, ROOT_SHORTCUT)) {
              if (isFileSystemSupported()) {
                menuItems.unshift(
                  {
                    action: () =>
                      mapFs("/")
                        .then((mappedFolder) => {
                          updateFolder("/", mappedFolder);
                          open("FileExplorer", {
                            url: join("/", mappedFolder),
                          });
                        })
                        .catch(() => {
                          // Ignore failure to map
                        }),
                    label: "Map directory",
                  },
                  MENU_SEPERATOR
                );
              }
            } else {
              menuItems.unshift(MENU_SEPERATOR);

              if (
                EXTRACTABLE_EXTENSIONS.has(pathExtension) ||
                MOUNTABLE_EXTENSIONS.has(pathExtension)
              ) {
                menuItems.unshift({
                  action: () => extractFiles(path),
                  label: "Extract Here",
                });
              }

              const canDecodeAudio = AUDIO_DECODE_FORMATS.has(pathExtension);
              const canDecodeImage = IMAGE_DECODE_FORMATS.has(pathExtension);
              const canDecodeVideo = VIDEO_DECODE_FORMATS.has(pathExtension);

              if (canDecodeAudio || canDecodeImage || canDecodeVideo) {
                const isAudioVideo = canDecodeAudio || canDecodeVideo;
                const ENCODE_FORMATS = isAudioVideo
                  ? canDecodeAudio
                    ? AUDIO_ENCODE_FORMATS
                    : VIDEO_ENCODE_FORMATS
                  : IMAGE_ENCODE_FORMATS;

                menuItems.unshift(MENU_SEPERATOR, {
                  label: "Convert to",
                  menu: ENCODE_FORMATS.filter(
                    (format) => format !== pathExtension
                  ).map((format) => {
                    const extension = format.replace(".", "");

                    return {
                      action: async () => {
                        const transcodeFiles: (
                          | FFmpegTranscodeFile
                          | ImageMagickConvertFile
                        )[] = await Promise.all(
                          absoluteEntries().map(async (absoluteEntry) => [
                            absoluteEntry,
                            await readFile(absoluteEntry),
                          ])
                        );
                        const transcodeFunction = isAudioVideo
                          ? (await import("utils/ffmpeg")).transcode
                          : (await import("utils/imagemagick")).convert;
                        const transcodedFiles = await transcodeFunction(
                          transcodeFiles,
                          extension
                        );

                        await Promise.all(
                          transcodedFiles.map(
                            async ([
                              transcodedFileName,
                              transcodedFileData,
                            ]) => {
                              const baseTranscodedName =
                                basename(transcodedFileName);
                              const transcodedDirName = dirname(path);

                              updateFolder(
                                transcodedDirName,
                                await createPath(
                                  baseTranscodedName,
                                  transcodedDirName,
                                  transcodedFileData
                                )
                              );
                            }
                          )
                        );
                      },
                      label: extension.toUpperCase(),
                    };
                  }),
                });
              }

              const canDecodeSpreadsheet =
                SPREADSHEET_FORMATS.includes(pathExtension);

              if (canDecodeSpreadsheet) {
                menuItems.unshift(MENU_SEPERATOR, {
                  label: "Convert to",
                  menu: SPREADSHEET_FORMATS.filter(
                    (format) => format !== pathExtension
                  ).map((format) => {
                    const extension = format.replace(".", "");

                    return {
                      action: () => {
                        absoluteEntries().forEach(async (absoluteEntry) => {
                          const newFilePath = `${dirname(
                            absoluteEntry
                          )}/${basename(
                            absoluteEntry,
                            extname(absoluteEntry)
                          )}.${extension}`;
                          const { convertSheet } = await import(
                            "utils/sheetjs"
                          );
                          const workBook = await convertSheet(
                            await readFile(absoluteEntry),
                            extension
                          );
                          const workBookDirName = dirname(path);

                          updateFolder(
                            workBookDirName,
                            await createPath(
                              basename(newFilePath),
                              workBookDirName,
                              Buffer.from(workBook)
                            )
                          );
                        });
                      },
                      label: extension.toUpperCase(),
                    };
                  }),
                });
              }

              const canEncodePlaylist =
                pathExtension !== ".m3u" &&
                AUDIO_PLAYLIST_EXTENSIONS.has(pathExtension);

              if (canEncodePlaylist) {
                menuItems.unshift(MENU_SEPERATOR, {
                  action: () => {
                    absoluteEntries().forEach(async (absoluteEntry) => {
                      const newFilePath = `${dirname(absoluteEntry)}/${basename(
                        absoluteEntry,
                        extname(absoluteEntry)
                      )}.m3u`;
                      const { createM3uPlaylist, tracksFromPlaylist } =
                        await import("components/apps/Webamp/functions");
                      const playlist = createM3uPlaylist(
                        (await tracksFromPlaylist(
                          (await readFile(absoluteEntry)).toString(),
                          extname(absoluteEntry)
                        )) as URLTrack[]
                      );
                      const playlistDirName = dirname(path);

                      updateFolder(
                        playlistDirName,
                        await createPath(
                          basename(newFilePath),
                          playlistDirName,
                          Buffer.from(playlist)
                        )
                      );
                    });
                  },
                  label: "Convert to M3U",
                });
              }

              menuItems.unshift(
                {
                  action: () => archiveFiles(absoluteEntries()),
                  label: "Add to archive...",
                },
                {
                  action: () => downloadFiles(absoluteEntries()),
                  label: "Download",
                }
              );

              if (!isShortcut && pid !== "FileExplorer") {
                TEXT_EDITORS.forEach((textEditor) => {
                  if (
                    textEditor !== defaultProcess &&
                    !openWithFiltered.includes(textEditor)
                  ) {
                    openWithFiltered.push(textEditor);
                  }
                });
              }
            }
          }

          if (IMAGE_FILE_EXTENSIONS.has(pathExtension)) {
            menuItems.unshift({
              label: "Set as desktop background",
              menu: [
                {
                  action: () => setWallpaper(path, "fill"),
                  label: "Fill",
                },
                {
                  action: () => setWallpaper(path, "fit"),
                  label: "Fit",
                },
                {
                  action: () => setWallpaper(path, "stretch"),
                  label: "Stretch",
                },
                {
                  action: () => setWallpaper(path, "tile"),
                  label: "Tile",
                },
                {
                  action: () => setWallpaper(path, "center"),
                  label: "Center",
                },
              ],
            });
          }

          menuItems.unshift(MENU_SEPERATOR);
        }

        if (remoteMount) {
          menuItems.push(MENU_SEPERATOR, {
            action: () => unMapFs(path),
            label: "Disconnect",
          });
        }

        if (EDITABLE_IMAGE_FILE_EXTENSIONS.has(urlExtension)) {
          menuItems.unshift({
            action: () => {
              open("Paint", { url });
            },
            label: "Edit",
          });
        }

        if (openWithFiltered.length > 0) {
          menuItems.unshift({
            label: "Open with",
            menu: openWithFiltered.map((id): MenuItem => {
              const { icon, title: label } = processDirectory[id] || {};
              const action = (): void => {
                openFile(id, icon);
              };

              return { action, icon, label };
            }),
          });
        }

        if (pid) {
          const { icon: pidIcon } = processDirectory[pid] || {};

          if (
            isShortcut &&
            url &&
            url !== "/" &&
            !url.startsWith("http:") &&
            !url.startsWith("https:")
          ) {
            const isFolder = urlExtension === "" || urlExtension === ".zip";

            menuItems.unshift({
              action: () => open("FileExplorer", { url: dirname(url) }, ""),
              label: `Open ${isFolder ? "folder" : "file"} location`,
            });
          }

          if (
            fileManagerId &&
            pid === "FileExplorer" &&
            !MOUNTABLE_EXTENSIONS.has(urlExtension)
          ) {
            menuItems.unshift({
              action: () => {
                openFile(pid, pidIcon);
              },
              label: "Open in new window",
            });
          }

          menuItems.unshift({
            action: () => {
              if (
                pid === "FileExplorer" &&
                fileManagerId &&
                !MOUNTABLE_EXTENSIONS.has(urlExtension)
              ) {
                changeUrl(fileManagerId, url);
              } else {
                openFile(pid, pidIcon);
              }
            },
            icon: pidIcon,
            label: "Open",
            primary: true,
          });
        }

        return menuItems;
      }),
    [
      archiveFiles,
      baseName,
      changeUrl,
      contextMenu,
      copyEntries,
      createPath,
      deleteLocalPath,
      downloadFiles,
      extractFiles,
      fileManagerId,
      focusedEntries,
      isFocusedEntry,
      lstat,
      mapFs,
      moveEntries,
      newShortcut,
      open,
      openFile,
      path,
      pid,
      readFile,
      readOnly,
      rootFs?.mntMap,
      rootFs?.mountList,
      setRenaming,
      setWallpaper,
      unMapFs,
      updateFolder,
      url,
    ]
  );

  return {
    onContextMenuCapture: (event?: React.MouseEvent | React.TouchEvent) => {
      if (!isFocusedEntry) {
        blurEntry();
        focusEntry(baseName);
      }
      onContextMenuCapture(event);
    },
    ...contextMenuHandlers,
  };
};

export default useFileContextMenu;
