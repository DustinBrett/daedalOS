import { basename, dirname, join } from "path";
import ini from "ini";
import { type FSModule } from "browserfs/dist/node/core/FS";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { monacoExtensions } from "components/apps/MonacoEditor/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import { type FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import { type FileStat } from "components/system/Files/FileManager/functions";
import { get9pModifiedTime, isMountedFolder } from "contexts/fileSystem/core";
import { type RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import processDirectory from "contexts/process/directory";
import {
  AUDIO_FILE_EXTENSIONS,
  BASE_2D_CONTEXT_OPTIONS,
  DECODED_VIDEO_FILE_EXTENSIONS,
  DEFAULT_LOCALE,
  DYNAMIC_EXTENSION,
  DYNAMIC_PREFIX,
  FOLDER_BACK_ICON,
  FOLDER_FRONT_ICON,
  FOLDER_ICON,
  HEIF_IMAGE_FORMATS,
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  ICON_GIF_FPS,
  ICON_GIF_SECONDS,
  IMAGE_FILE_EXTENSIONS,
  MAX_ICON_SIZE,
  MAX_THUMBNAIL_FILE_SIZE,
  MOUNTED_FOLDER_ICON,
  NATIVE_IMAGE_FORMATS,
  NEW_FOLDER_ICON,
  ONE_TIME_PASSIVE_EVENT,
  PHOTO_ICON,
  SHORTCUT_EXTENSION,
  SHORTCUT_ICON,
  SMALLEST_PNG_SIZE,
  SYSTEM_FILES,
  SYSTEM_PATHS,
  TIFF_IMAGE_FORMATS,
  UNKNOWN_ICON_PATH,
  VIDEO_FALLBACK_MIME_TYPE,
  VIDEO_FILE_EXTENSIONS,
  YT_ICON_CACHE,
} from "utils/constants";
import shortcutCache from "public/.index/shortcutCache.json";
import {
  blobToBase64,
  bufferToBlob,
  bufferToUrl,
  getExtension,
  getGifJs,
  getHtmlToImage,
  getMimeType,
  getTZOffsetISOString,
  isSafari,
  isYouTubeUrl,
  resizeImage,
} from "utils/functions";

type InternetShortcut = {
  BaseURL: string;
  Comment: string;
  IconFile: string;
  Type: string;
  URL: string;
};

type ShellClassInfo = {
  ShellClassInfo: {
    IconFile: string;
  };
};

type VideoElementWithSeek = HTMLVideoElement & {
  seekToNextFrame: () => Promise<void>;
};

export const isExistingFile = (
  { birthtimeMs, ctimeMs }: Stats = {} as Stats
): boolean => Boolean(birthtimeMs && birthtimeMs === ctimeMs);

export const getModifiedTime = (path: string, stats: FileStat): number => {
  const { mtimeMs } = stats;

  if (isExistingFile(stats)) {
    const storedMtime = get9pModifiedTime(path);

    if (storedMtime > 0) return storedMtime;
  }

  return mtimeMs;
};

export const getIconFromIni = (
  fs: FSModule,
  directory: string
): Promise<string> =>
  new Promise((resolve) => {
    const iniPath = join(directory, "desktop.ini");

    fs.lstat(iniPath, (statError, stats) => {
      if (statError) resolve("");
      else if (stats && isExistingFile(stats)) {
        import("public/.index/iniIcons.json").then(({ default: iniCache }) =>
          resolve(iniCache[directory as keyof typeof iniCache] || "")
        );
      } else {
        fs.readFile(iniPath, (readError, contents = Buffer.from("")) => {
          if (readError) resolve("");
          else {
            const {
              ShellClassInfo: { IconFile = "" },
            } = ini.parse(contents.toString()) as ShellClassInfo;

            resolve(IconFile);
          }
        });
      }
    });
  });

const getDefaultFileViewer = (extension: string): string => {
  if (AUDIO_FILE_EXTENSIONS.has(extension)) return "VideoPlayer";
  if (VIDEO_FILE_EXTENSIONS.has(extension)) return "VideoPlayer";
  if (DECODED_VIDEO_FILE_EXTENSIONS.has(extension)) return "VideoPlayer";
  if (IMAGE_FILE_EXTENSIONS.has(extension)) return "Photos";
  if (monacoExtensions.has(extension)) return "MonacoEditor";

  return "";
};

export const getIconByFileExtension = (extension: string): string => {
  const { icon: extensionIcon = "", process: [defaultProcess = ""] = [] } =
    extension in extensions ? extensions[extension] : {};

  if (extensionIcon) return `/System/Icons/${extensionIcon}.webp`;

  return (
    processDirectory[defaultProcess || getDefaultFileViewer(extension)]?.icon ||
    UNKNOWN_ICON_PATH
  );
};

export const getProcessByFileExtension = (extension: string): string => {
  const [defaultProcess = ""] =
    extension in extensions
      ? extensions[extension].process
      : [getDefaultFileViewer(extension)];

  return defaultProcess;
};

export const getShortcutInfo = (
  contents?: Buffer,
  shortcutData?: InternetShortcut
): FileInfo => {
  const {
    InternetShortcut: {
      BaseURL: pid = "",
      Comment: comment = "",
      IconFile: icon = "",
      Type: type = "",
      URL: url = "",
    } = {},
  } = shortcutData
    ? { InternetShortcut: shortcutData }
    : ((ini.parse(contents?.toString() || "") || {}) as {
        InternetShortcut: InternetShortcut;
      });

  return {
    comment,
    icon,
    pid,
    type,
    url,
  };
};

export const getCachedShortcut = (path: string): FileInfo =>
  getShortcutInfo(
    undefined,
    (
      shortcutCache as unknown as Record<
        string,
        Record<string, InternetShortcut>
      >
    )?.[dirname(path)]?.[basename(path)]
  );

export const createShortcut = (shortcut: Partial<InternetShortcut>): string =>
  ini
    .encode(shortcut, {
      section: "InternetShortcut",
      whitespace: false,
    })
    .replace(/"/g, "");

export const makeExternalShortcut = (contents: Buffer): Buffer => {
  const { pid, url } = getShortcutInfo(contents);

  return Buffer.from(
    createShortcut({
      URL: encodeURI(
        `${window.location.origin}${pid ? `/?app=${pid}` : ""}${
          url ? `${pid ? "&" : "/?"}url=${url}` : ""
        }`
      ),
    })
  );
};

export const getCachedIconUrl = async (
  fs: FSModule,
  cachedIconPath: string
): Promise<string> =>
  new Promise((resolve) => {
    fs.lstat(cachedIconPath, (statError, cachedIconStats) => {
      if (!statError && cachedIconStats) {
        if (isExistingFile(cachedIconStats)) {
          resolve(cachedIconPath);
        } else {
          fs.readFile(
            cachedIconPath,
            (readError, cachedIconData = Buffer.from("")) => {
              if (cachedIconData.length >= SMALLEST_PNG_SIZE) {
                resolve(bufferToUrl(cachedIconData));
              } else if (!readError) fs.unlink(cachedIconPath);
            }
          );
        }
      } else resolve("");
    });
  });

const getIconsFromCache = (fs: FSModule, path: string): Promise<string[]> =>
  new Promise((resolve) => {
    const iconCacheDirectory = join(ICON_CACHE, path);

    fs?.readdir(iconCacheDirectory, async (dirError, possibleIcons = []) => {
      if (dirError) resolve([]);
      else {
        const [firstIcon, ...otherIcons] = possibleIcons.filter((icon) =>
          icon?.endsWith(ICON_CACHE_EXTENSION)
        );

        resolve(
          (
            await Promise.all(
              [firstIcon, otherIcons[otherIcons.length - 1]]
                .filter(Boolean)
                .map(
                  (cachedIcon): Promise<string> =>
                    // eslint-disable-next-line promise/param-names
                    new Promise((resolveIcon) => {
                      getCachedIconUrl(
                        fs,
                        join(iconCacheDirectory, cachedIcon)
                      ).then(resolveIcon);
                    })
                )
            )
          ).filter(Boolean)
        );
      }
    });
  });

export const getCoverArt = async (
  url: string,
  buffer: Buffer,
  signal?: AbortSignal
): Promise<Buffer | undefined> => {
  if (signal?.aborted) return undefined;

  try {
    const { parseBuffer, selectCover } = await import("music-metadata-browser");
    const { common: { picture } = {} } = await parseBuffer(
      buffer,
      { mimeType: getMimeType(url), size: buffer.length },
      { skipPostHeaders: true }
    );

    if (signal?.aborted) return undefined;

    const { data: coverPicture } = selectCover(picture) || {};

    return coverPicture;
  } catch {
    // Ignore failure to get cover art
  }

  return undefined;
};

export const getInfoWithoutExtension = (
  fs: FSModule,
  rootFs: RootFileSystem,
  path: string,
  isDirectory: boolean,
  hasNewFolderIcon: boolean,
  callback: (value: FileInfo) => void,
  lazy = true
): void => {
  if (isDirectory) {
    const setFolderInfo = (
      icon: string,
      subIcons?: string[],
      getIcon?: () => Promise<void>
    ): void =>
      callback({ getIcon, icon, pid: "FileExplorer", subIcons, url: path });
    const getFolderIcon = (): string => {
      if (isMountedFolder(rootFs?.mntMap[path])) {
        return MOUNTED_FOLDER_ICON;
      }
      if (hasNewFolderIcon) return NEW_FOLDER_ICON;
      return FOLDER_ICON;
    };
    const folderIcon = getFolderIcon();
    const getDynamicIcon = async (): Promise<void> => {
      const iconFromIni = await getIconFromIni(fs, path);

      if (iconFromIni) setFolderInfo(iconFromIni);
      else if (folderIcon === FOLDER_ICON) {
        const iconsFromCache = await getIconsFromCache(fs, path);

        if (iconsFromCache.length > 0) {
          setFolderInfo(FOLDER_BACK_ICON, [
            ...iconsFromCache,
            FOLDER_FRONT_ICON,
          ]);
        } else if (!lazy) {
          setFolderInfo(folderIcon, []);
        }
      }
    };

    if (lazy) {
      setFolderInfo(folderIcon, [], getDynamicIcon);
    } else {
      getDynamicIcon();
    }
  } else {
    callback({ icon: UNKNOWN_ICON_PATH, pid: "", url: path });
  }
};

export const getInfoWithExtension = (
  fs: FSModule,
  path: string,
  extension: string,
  callback: (value: FileInfo) => void
): void => {
  const subIcons: string[] = [];
  const getInfoByFileExtension = (
    icon?: string,
    getIcon?: true | ((signal: AbortSignal) => void | Promise<void>)
  ): void =>
    callback({
      getIcon,
      icon: icon || getIconByFileExtension(extension),
      pid: getProcessByFileExtension(extension),
      subIcons,
      url: path,
    });
  const decodeImage = (): void =>
    getInfoByFileExtension(PHOTO_ICON, (signal) =>
      fs.readFile(path, async (error, contents = Buffer.from("")) => {
        if (!error && contents.length > 0 && !signal.aborted) {
          let image = contents;

          if (!NATIVE_IMAGE_FORMATS.has(extension)) {
            const { decodeImageToBuffer } = await import("utils/imageDecoder");

            if (!signal.aborted) {
              const decodedImage = await decodeImageToBuffer(
                extension,
                contents
              );

              if (decodedImage) image = decodedImage;
            }
          }

          if (!signal.aborted) {
            getInfoByFileExtension(bufferToUrl(image, getMimeType(path)));
          }
        }
      })
    );

  switch (extension) {
    case SHORTCUT_EXTENSION:
      {
        const handleShortcut = ({
          comment,
          icon,
          pid,
          url,
        }: FileInfo): void => {
          const urlExt = getExtension(url);

          if (pid !== "ExternalURL") subIcons.push(SHORTCUT_ICON);

          if (pid === "FileExplorer" && !icon) {
            const iconCallback = (newIcon?: string): void => {
              if (!newIcon) return;

              callback({
                comment,
                icon: newIcon,
                pid,
                subIcons,
                url,
              });
            };
            const getIcon = (): void => {
              if (urlExt) {
                getInfoWithExtension(fs, url, urlExt, ({ icon: extIcon }) =>
                  iconCallback(extIcon)
                );
              } else {
                getIconFromIni(fs, url).then(iconCallback);
              }
            };

            callback({
              comment,
              getIcon,
              icon: processDirectory[pid]?.icon,
              pid,
              subIcons,
              url,
            });
          } else if (
            DYNAMIC_EXTENSION.has(urlExt) ||
            DYNAMIC_PREFIX.some((prefix) => url.startsWith(prefix))
          ) {
            const isCachedUrl = DYNAMIC_EXTENSION.has(urlExt);
            const cachedIconPath = join(
              ICON_CACHE,
              `${isCachedUrl ? url : path}${ICON_CACHE_EXTENSION}`
            );

            fs.lstat(cachedIconPath, (statError, cachedIconStats) => {
              if (!statError && cachedIconStats) {
                if (isExistingFile(cachedIconStats)) {
                  callback({
                    comment,
                    icon: cachedIconPath,
                    pid,
                    subIcons,
                    url,
                  });
                } else {
                  fs.readFile(cachedIconPath, (_readError, cachedIconData) =>
                    callback({
                      comment,
                      icon: bufferToUrl(cachedIconData as Buffer),
                      pid,
                      subIcons,
                      url,
                    })
                  );
                }
              } else {
                getInfoWithExtension(fs, url, urlExt, (fileInfo) => {
                  const {
                    icon: urlIcon = icon,
                    getIcon,
                    subIcons: fileSubIcons = [],
                  } = fileInfo;

                  if (fileSubIcons.length > 0) {
                    subIcons.push(
                      ...fileSubIcons.filter(
                        (subIcon) => !subIcons.includes(subIcon)
                      )
                    );
                  }

                  callback({
                    comment,
                    getIcon,
                    icon: urlIcon,
                    pid,
                    subIcons,
                    url,
                  });
                });
              }
            });
          } else if (isYouTubeUrl(url)) {
            const ytId = new URL(url).pathname.replace("/", "");
            const cachedIconPath = join(
              YT_ICON_CACHE,
              `${ytId}${ICON_CACHE_EXTENSION}`
            );
            const baseFileInfo = {
              comment,
              pid,
              url,
            };
            const isDefaultIcon =
              !icon || icon === processDirectory.VideoPlayer.icon;
            const videoSubIcons = [processDirectory.VideoPlayer.icon];

            callback({
              ...baseFileInfo,
              getIcon: isDefaultIcon
                ? () =>
                    fs.exists(cachedIconPath, (cachedIconExists) =>
                      callback({
                        ...baseFileInfo,
                        icon: cachedIconExists
                          ? cachedIconPath
                          : `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`,
                        subIcons: videoSubIcons,
                      })
                    )
                : undefined,
              icon: icon || processDirectory.VideoPlayer.icon,
              subIcons: isDefaultIcon ? undefined : videoSubIcons,
            });
          } else {
            callback({
              comment,
              getIcon: icon
                ? undefined
                : () =>
                    getInfoWithExtension(fs, url, urlExt, ({ icon: extIcon }) =>
                      callback({
                        comment,
                        icon: extIcon || processDirectory[pid]?.icon,
                        pid,
                        subIcons,
                        url,
                      })
                    ),
              icon: icon || UNKNOWN_ICON_PATH,
              pid,
              subIcons,
              url,
            });
          }
        };

        fs.lstat(path, (statError, stats) => {
          if (statError) getInfoByFileExtension();
          else if (isExistingFile(stats)) {
            handleShortcut(getCachedShortcut(path));
          } else {
            fs.readFile(path, (readError, contents): void => {
              if (readError || !contents) getInfoByFileExtension();
              else handleShortcut(getShortcutInfo(contents));
            });
          }
        });
      }
      break;
    case ".exe":
      getInfoByFileExtension("/System/Icons/executable.webp", (signal) =>
        fs.readFile(path, async (error, contents = Buffer.from("")) => {
          if (!error && contents.length > 0 && !signal.aborted) {
            const { extractExeIcon } = await import(
              "components/system/Files/FileEntry/exeIcons"
            );
            const exeIcon = await extractExeIcon(contents);

            if (exeIcon && !signal.aborted) {
              getInfoByFileExtension(bufferToUrl(exeIcon));
            }
          }
        })
      );
      break;
    case ".flac":
    case ".m4a":
    case ".mp3":
      getInfoByFileExtension(
        extension === ".mp3"
          ? `/System/Icons/${extensions[".mp3"].icon as string}.webp`
          : undefined,
        (signal) =>
          fs.readFile(path, (error, contents = Buffer.from("")) => {
            if (!error && !signal.aborted) {
              getCoverArt(path, contents, signal).then((coverPicture) => {
                if (coverPicture) {
                  getInfoByFileExtension(bufferToUrl(coverPicture));
                }
              });
            }
          })
      );
      break;
    case ".sav":
      getInfoByFileExtension(UNKNOWN_ICON_PATH, true);
      break;
    case ".ani":
    case ".cur":
    case ".jxl":
    case ".qoi":
      decodeImage();
      break;
    case ".whtml":
      getInfoByFileExtension("/System/Icons/tinymce.webp", (signal) =>
        fs.readFile(path, async (error, contents = Buffer.from("")) => {
          if (!error && contents.length > 0 && !signal.aborted) {
            const htmlToImage = await getHtmlToImage();
            const containerElement = document.createElement("div");

            containerElement.style.height = "600px";
            containerElement.style.width = "600px";
            containerElement.style.padding = "32px";
            containerElement.style.backgroundColor = "#fff";
            containerElement.style.zIndex = "-1";
            containerElement.style.overflow = "hidden";
            containerElement.style.opacity = "0";
            containerElement.style.userSelect = "none";
            // eslint-disable-next-line deprecation/deprecation
            containerElement.style.webkitUserSelect = "none";

            containerElement.innerHTML = contents.toString();

            document.body.append(containerElement);

            let documentImage: string | undefined;

            try {
              documentImage = await htmlToImage?.toPng(containerElement, {
                skipAutoScale: true,
                style: {
                  opacity: "1",
                },
              });
            } catch {
              // Ignore failure to captrure
            }

            containerElement.remove();

            if (documentImage && documentImage.length > SMALLEST_PNG_SIZE) {
              getInfoByFileExtension(documentImage);
            }
          }
        })
      );
      break;
    default:
      if (
        HEIF_IMAGE_FORMATS.has(extension) ||
        TIFF_IMAGE_FORMATS.has(extension)
      ) {
        decodeImage();
      } else if (IMAGE_FILE_EXTENSIONS.has(extension)) {
        getInfoByFileExtension(PHOTO_ICON, (signal) =>
          fs.readFile(path, (error, contents = Buffer.from("")) => {
            if (!error && contents.length > 0 && !signal.aborted) {
              const imageIcon = new Image();

              imageIcon.addEventListener(
                "load",
                () => getInfoByFileExtension(imageIcon.src),
                { signal, ...ONE_TIME_PASSIVE_EVENT }
              );
              imageIcon.decoding = "async";

              const mimeType = getMimeType(path);

              if (contents.length > MAX_THUMBNAIL_FILE_SIZE) {
                resizeImage(
                  bufferToBlob(contents, mimeType),
                  MAX_ICON_SIZE
                ).then((resizedBlob) => {
                  imageIcon.src = URL.createObjectURL(resizedBlob);
                });
              } else {
                imageIcon.src = bufferToUrl(contents, mimeType);
              }
            }
          })
        );
      } else if (AUDIO_FILE_EXTENSIONS.has(extension)) {
        getInfoByFileExtension(processDirectory.VideoPlayer.icon);
      } else if (VIDEO_FILE_EXTENSIONS.has(extension)) {
        subIcons.push(processDirectory.VideoPlayer.icon);
        getInfoByFileExtension(processDirectory.VideoPlayer.icon, (signal) =>
          fs.readFile(path, async (error, contents = Buffer.from("")) => {
            if (!error) {
              const video = document.createElement("video");
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d", {
                ...BASE_2D_CONTEXT_OPTIONS,
                willReadFrequently: true,
              });
              const gif = await getGifJs();
              let framesRemaining = ICON_GIF_FPS * ICON_GIF_SECONDS;
              const getFrame = (
                second: number,
                firstFrame: boolean
              ): Promise<void> =>
                new Promise((resolve) => {
                  video.currentTime = second;

                  if ("seekToNextFrame" in video) {
                    (video as VideoElementWithSeek)
                      .seekToNextFrame?.()
                      .catch(() => {
                        // Ignore error during seekToNextFrame
                      });
                  } else if (firstFrame) {
                    video.load();
                  }

                  const processFrame = (): void => {
                    if (!context || !canvas.width || !canvas.height) return;

                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    gif.addFrame(
                      context.getImageData(0, 0, canvas.width, canvas.height),
                      { copy: true, delay: 100 }
                    );
                    framesRemaining -= 1;

                    if (framesRemaining === 0) {
                      gif
                        .on("finished", (blob) => {
                          blobToBase64(blob).then(getInfoByFileExtension);
                          gif.freeWorkers.forEach((worker) =>
                            worker?.terminate()
                          );
                        })
                        .render();
                    }

                    resolve();
                  };

                  if ("requestVideoFrameCallback" in video) {
                    video.requestVideoFrameCallback(processFrame);
                  } else {
                    (video as HTMLVideoElement).addEventListener(
                      "canplaythrough",
                      processFrame,
                      { signal, ...ONE_TIME_PASSIVE_EVENT }
                    );
                  }
                });

              video.addEventListener(
                "loadeddata",
                () => {
                  canvas.height =
                    video.videoHeight > video.videoWidth
                      ? MAX_ICON_SIZE
                      : (MAX_ICON_SIZE * video.videoHeight) / video.videoWidth;
                  canvas.width =
                    video.videoWidth > video.videoHeight
                      ? MAX_ICON_SIZE
                      : (MAX_ICON_SIZE * video.videoWidth) / video.videoHeight;

                  const capturePoints = [
                    video.duration / 4,
                    video.duration / 2,
                  ];
                  const frameStep = 4 / ICON_GIF_FPS;
                  const frameCount = framesRemaining / capturePoints.length;

                  capturePoints.forEach(async (capturePoint, index) => {
                    if (signal.aborted) return;

                    for (
                      let frame = capturePoint;
                      frame < capturePoint + frameCount * frameStep;
                      frame += frameStep
                    ) {
                      if (signal.aborted) return;

                      const firstFrame = index === 0;

                      // eslint-disable-next-line no-await-in-loop
                      await getFrame(frame, firstFrame);

                      if (firstFrame && frame === capturePoint) {
                        getInfoByFileExtension(canvas.toDataURL("image/jpeg"));
                      }
                    }
                  });
                },
                { signal, ...ONE_TIME_PASSIVE_EVENT }
              );

              video.src = bufferToUrl(
                contents,
                isSafari()
                  ? getMimeType(path) || VIDEO_FALLBACK_MIME_TYPE
                  : undefined
              );
            }
          })
        );
      } else {
        getInfoByFileExtension();
      }
  }
};

export const filterSystemFiles =
  (directory: string) =>
  (file: string): boolean =>
    !SYSTEM_PATHS.has(join(directory, file)) && !SYSTEM_FILES.has(file);

type WrapData = {
  lines: string[];
  truncatedText: string;
  width: number;
};

const canvasContexts = Object.create(null) as Record<
  string,
  CanvasRenderingContext2D
>;

export const measureText = (
  text: string,
  fontSize: string,
  fontFamily: string
): number => {
  const font = `${fontSize} ${fontFamily}`;

  if (!canvasContexts[font]) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext(
      "2d",
      BASE_2D_CONTEXT_OPTIONS
    ) as CanvasRenderingContext2D;

    context.font = font;
    canvasContexts[font] = context;
  }
  const { actualBoundingBoxLeft, actualBoundingBoxRight } =
    canvasContexts[font].measureText(text);

  return Math.abs(actualBoundingBoxLeft) + Math.abs(actualBoundingBoxRight);
};

export const getTextWrapData = (
  text: string,
  fontSize: string,
  fontFamily: string,
  maxWidth: number
): WrapData => {
  const lines = [""];
  const totalWidth = measureText(text, fontSize, fontFamily);
  let truncatedText = "";

  if (totalWidth <= maxWidth) {
    return { lines: [text], truncatedText: text, width: totalWidth };
  }

  [...text].forEach((character, characterIndex) => {
    const currentLineIndex = lines.length - 1;

    if (currentLineIndex < 2) truncatedText += character;

    const isEmptyLine =
      lines[currentLineIndex] === "" || lines[currentLineIndex] === " ";
    const isSpaceCharacter = character === " ";

    if (isEmptyLine && isSpaceCharacter) {
      lines[currentLineIndex] = "";
      return;
    }

    const newLineText = `${lines[currentLineIndex]}${character}`;
    const newLineWidth = measureText(newLineText, fontSize, fontFamily);

    if (newLineWidth > maxWidth) {
      if (currentLineIndex === 1) truncatedText = truncatedText.slice(0, -1);

      if (text[characterIndex + 1] === " " || !newLineText.includes(" ")) {
        lines.push(character);
      } else {
        const lastSpaceIndex = newLineText.lastIndexOf(" ");

        lines[currentLineIndex] = newLineText.slice(0, lastSpaceIndex);

        lines.push(newLineText.slice(lastSpaceIndex + 1));
      }
    } else {
      lines[currentLineIndex] = newLineText;
    }
  });

  return {
    lines,
    truncatedText,
    width: Math.min(maxWidth, totalWidth),
  };
};

export const getDateModified = (
  path: string,
  fullStats: Stats,
  format: Intl.DateTimeFormatOptions
): string => {
  const modifiedTime = getModifiedTime(path, fullStats);
  const date = getTZOffsetISOString(modifiedTime).slice(0, 10);
  const time = new Intl.DateTimeFormat(DEFAULT_LOCALE, format).format(
    modifiedTime
  );

  return `${date} ${time}`;
};

export const getFileType = (extension: string): string => {
  const ext = extension.toUpperCase();

  switch (ext) {
    case ".URL":
      return "Shortcut";
    case ".TXT":
      return "Text Document";
    case ".RTF":
    case ".WHTML":
      return "Rich Text Document";
    default:
      return extensions[extension]?.type || `${ext.replace(".", "")} File`;
  }
};
