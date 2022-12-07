import type { FSModule } from "browserfs/dist/node/core/FS";
import { monacoExtensions } from "components/apps/MonacoEditor/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import type { FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import type { FileStat } from "components/system/Files/FileManager/functions";
import { get9pModifiedTime } from "contexts/fileSystem/functions";
import type { RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import processDirectory from "contexts/process/directory";
import ini from "ini";
import { extname, join } from "path";
import {
  AUDIO_FILE_EXTENSIONS,
  BASE_2D_CONTEXT_OPTIONS,
  DYNAMIC_EXTENSION,
  FOLDER_BACK_ICON,
  FOLDER_FRONT_ICON,
  FOLDER_ICON,
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  ICON_GIF_FPS,
  ICON_GIF_SECONDS,
  IMAGE_FILE_EXTENSIONS,
  MOUNTED_FOLDER_ICON,
  MP3_MIME_TYPE,
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
  VIDEO_FILE_EXTENSIONS,
  YT_ICON_CACHE,
} from "utils/constants";
import {
  blobToBase64,
  bufferToUrl,
  getGifJs,
  getHtmlToImage,
  imageToBufferUrl,
  isYouTubeUrl,
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

export const getModifiedTime = (path: string, stats: FileStat): number => {
  const { atimeMs, ctimeMs, mtimeMs } = stats;

  return atimeMs === ctimeMs && ctimeMs === mtimeMs
    ? get9pModifiedTime(path) || mtimeMs
    : mtimeMs;
};

export const getIconFromIni = (
  fs: FSModule,
  directory: string
): Promise<string> =>
  new Promise((resolve) => {
    fs.readFile(
      join(directory, "desktop.ini"),
      (error, contents = Buffer.from("")) => {
        if (error) resolve("");
        else {
          const {
            ShellClassInfo: { IconFile = "" },
          } = ini.parse(contents.toString()) as ShellClassInfo;

          resolve(IconFile);
        }
      }
    );
  });

export const getDefaultFileViewer = (extension: string): string => {
  if (AUDIO_FILE_EXTENSIONS.has(extension)) return "VideoPlayer";
  if (VIDEO_FILE_EXTENSIONS.has(extension)) return "VideoPlayer";
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

export const getShortcutInfo = (contents: Buffer): FileInfo => {
  const {
    InternetShortcut: {
      BaseURL: pid = "",
      Comment: comment = "",
      IconFile: icon = "",
      Type: type = "",
      URL: url = "",
    },
  } = (ini.parse(contents.toString()) || {}) as {
    InternetShortcut: InternetShortcut;
  };

  if (!icon && pid) {
    return { comment, icon: processDirectory[pid]?.icon, pid, type, url };
  }

  return { comment, icon, pid, type, url };
};

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

const getIconsFromCache = (fs: FSModule, path: string): Promise<string[]> =>
  new Promise((resolveIcons) => {
    const iconCacheDirectory = join(ICON_CACHE, path);

    fs?.readdir(
      iconCacheDirectory,
      async (dirError, [firstIcon, ...otherIcons] = []) => {
        if (dirError) resolveIcons([]);
        else {
          resolveIcons(
            (
              await Promise.all(
                [firstIcon, otherIcons[otherIcons.length - 1]]
                  .filter(Boolean)
                  .map(
                    (cachedIcon): Promise<string> =>
                      new Promise((resolveIcon) => {
                        fs?.readFile(
                          join(iconCacheDirectory, cachedIcon),
                          (fileError, contents = Buffer.from("")) => {
                            resolveIcon(fileError ? "" : bufferToUrl(contents));
                          }
                        );
                      })
                  )
              )
            ).filter(Boolean)
          );
        }
      }
    );
  });

export const getInfoWithoutExtension = (
  fs: FSModule,
  rootFs: RootFileSystem,
  path: string,
  isDirectory: boolean,
  useNewFolderIcon: boolean,
  callback: (value: FileInfo) => void
): void => {
  if (isDirectory) {
    const setFolderInfo = (
      icon: string,
      subIcons?: string[],
      getIcon?: () => Promise<void>
    ): void =>
      callback({ getIcon, icon, pid: "FileExplorer", subIcons, url: path });
    const getFolderIcon = (): string => {
      if (rootFs?.mntMap[path]?.getName() === "FileSystemAccess") {
        return MOUNTED_FOLDER_ICON;
      }
      if (useNewFolderIcon) return NEW_FOLDER_ICON;
      return FOLDER_ICON;
    };
    const folderIcon = getFolderIcon();

    setFolderInfo(folderIcon, [], async () => {
      const iconFromIni = await getIconFromIni(fs, path);

      if (iconFromIni) setFolderInfo(iconFromIni);
      else if (folderIcon === FOLDER_ICON) {
        const iconsFromCache = await getIconsFromCache(fs, path);

        if (iconsFromCache.length > 0) {
          setFolderInfo(FOLDER_BACK_ICON, [
            ...iconsFromCache,
            FOLDER_FRONT_ICON,
          ]);
        }
      }
    });
  } else {
    callback({ icon: UNKNOWN_ICON_PATH, pid: "", url: path });
  }
};

const getFirstAniImage = async (
  imageBuffer: Buffer
): Promise<Buffer | undefined> => {
  const { parseAni } = await import("ani-cursor/dist/parser");
  let firstImage: Uint8Array;

  try {
    ({
      images: [firstImage],
    } = parseAni(imageBuffer));

    return Buffer.from(firstImage);
  } catch {
    // Can't parse ani
  }

  return undefined;
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
    getIcon?: true | ((signal: AbortSignal) => void)
  ): void =>
    callback({
      getIcon,
      icon: icon || getIconByFileExtension(extension),
      pid: getProcessByFileExtension(extension),
      subIcons,
      url: path,
    });

  switch (extension) {
    case SHORTCUT_EXTENSION:
      fs.readFile(path, (error, contents = Buffer.from("")) => {
        subIcons.push(SHORTCUT_ICON);

        if (error) {
          getInfoByFileExtension();
          return;
        }

        const { comment, icon, pid, url } = getShortcutInfo(contents);
        const urlExt = extname(url).toLowerCase();

        if (pid === "FileExplorer" && !icon) {
          const getIcon = (): void => {
            getIconFromIni(fs, url).then((iniIcon) => {
              if (iniIcon) {
                callback({ comment, icon: iniIcon, pid, subIcons, url });
              }
            });
          };

          callback({ comment, getIcon, icon, pid, subIcons, url });
        } else if (DYNAMIC_EXTENSION.has(urlExt)) {
          const cachedIconPath = join(
            ICON_CACHE,
            `${url}${ICON_CACHE_EXTENSION}`
          );

          fs.lstat(cachedIconPath, (statError, cachedIconStats) => {
            if (!statError && cachedIconStats) {
              if (cachedIconStats.birthtimeMs === cachedIconStats.ctimeMs) {
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

          fs.exists(cachedIconPath, (cachedIconExists) =>
            callback({
              comment,
              icon: cachedIconExists
                ? cachedIconPath
                : `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`,
              pid,
              subIcons: [processDirectory.VideoPlayer.icon],
              url,
            })
          );
        } else {
          callback({
            comment,
            icon: icon || UNKNOWN_ICON_PATH,
            pid,
            subIcons,
            url,
          });
        }
      });
      break;
    case ".ani":
      getInfoByFileExtension(PHOTO_ICON, (signal) =>
        fs.readFile(path, async (error, contents = Buffer.from("")) => {
          if (!error && contents.length > 0 && !signal.aborted) {
            const firstImage = await getFirstAniImage(contents);

            if (firstImage && !signal.aborted) {
              getInfoByFileExtension(imageToBufferUrl(path, firstImage));
            }
          }
        })
      );
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
    case ".mp3":
      getInfoByFileExtension(
        `/System/Icons/${extensions[".mp3"].icon as string}.webp`,
        (signal) =>
          fs.readFile(path, (error, contents = Buffer.from("")) => {
            if (!error && !signal.aborted) {
              import("music-metadata-browser").then(
                ({ parseBuffer, selectCover }) => {
                  if (signal.aborted) return;

                  parseBuffer(
                    contents,
                    {
                      mimeType: MP3_MIME_TYPE,
                      size: contents.length,
                    },
                    { skipPostHeaders: true }
                  ).then(({ common: { picture } = {} }) => {
                    if (signal.aborted) return;

                    const { data: coverPicture } = selectCover(picture) || {};

                    if (coverPicture) {
                      getInfoByFileExtension(bufferToUrl(coverPicture));
                    }
                  });
                }
              );
            }
          })
      );
      break;
    case ".sav":
      getInfoByFileExtension(UNKNOWN_ICON_PATH, true);
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

            containerElement.innerHTML = contents.toString();

            document.body.append(containerElement);
            const documentImage = await htmlToImage?.toPng(containerElement, {
              skipAutoScale: true,
            });
            containerElement.remove();

            if (documentImage && documentImage.length > SMALLEST_PNG_SIZE) {
              getInfoByFileExtension(documentImage);
            }
          }
        })
      );
      break;
    default:
      if (TIFF_IMAGE_FORMATS.has(extension)) {
        getInfoByFileExtension(PHOTO_ICON, (signal) =>
          fs.readFile(path, async (error, contents = Buffer.from("")) => {
            if (!error && contents.length > 0 && !signal.aborted) {
              const firstImage = (await import("utif")).bufferToURI(contents);

              if (firstImage && !signal.aborted) {
                getInfoByFileExtension(firstImage);
              }
            }
          })
        );
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
              imageIcon.addEventListener(
                "error",
                async () => {
                  if (extension === ".cur") {
                    const firstImage = await getFirstAniImage(contents);

                    if (firstImage && !signal.aborted) {
                      getInfoByFileExtension(
                        imageToBufferUrl(path, firstImage)
                      );
                    }
                  }
                },
                { signal, ...ONE_TIME_PASSIVE_EVENT }
              );
              imageIcon.src = imageToBufferUrl(path, contents);
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
              const gif = await getGifJs();
              let framesRemaining = ICON_GIF_FPS * ICON_GIF_SECONDS;
              const getFrame = (second: number): Promise<void> =>
                new Promise((resolve) => {
                  video.addEventListener(
                    "canplaythrough",
                    () => {
                      const context = canvas.getContext("2d", {
                        ...BASE_2D_CONTEXT_OPTIONS,
                        willReadFrequently: true,
                      });

                      if (!context || !canvas.width || !canvas.height) return;

                      context.drawImage(
                        video,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                      );
                      const imageData = context.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                      );
                      gif.addFrame(imageData, {
                        copy: true,
                        delay: 100,
                      });
                      framesRemaining -= 1;

                      if (framesRemaining === 0) {
                        gif
                          .on("finished", (blob) =>
                            blobToBase64(blob).then(getInfoByFileExtension)
                          )
                          .render();
                      }

                      resolve();
                    },
                    { signal, ...ONE_TIME_PASSIVE_EVENT }
                  );
                  video.currentTime = second;
                  if ("seekToNextFrame" in video) {
                    (video as VideoElementWithSeek)
                      .seekToNextFrame?.()
                      .catch(() => video.load());
                  } else {
                    video.load();
                  }
                });

              video.addEventListener(
                "loadeddata",
                () => {
                  canvas.height = video.videoHeight;
                  canvas.width = video.videoWidth;

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

                      // eslint-disable-next-line no-await-in-loop
                      await getFrame(frame);

                      if (index === 0 && frame === capturePoint) {
                        getInfoByFileExtension(canvas.toDataURL("image/jpeg"));
                      }
                    }
                  });
                },
                { signal, ...ONE_TIME_PASSIVE_EVENT }
              );
              video.src = bufferToUrl(contents);
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
  width: number;
};

const canvasContexts = Object.create(null) as Record<
  string,
  CanvasRenderingContext2D
>;

const measureText = (
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
  maxWidth?: number
): WrapData => {
  const lines = [""];

  const totalWidth = measureText(text, fontSize, fontFamily);

  if (!maxWidth) return { lines: [text], width: totalWidth };

  if (totalWidth > maxWidth) {
    const words = text.split(" ");

    [...text].forEach((character) => {
      const lineIndex = lines.length - 1;
      const lineText = `${lines[lineIndex]}${character}`;
      const lineWidth = measureText(lineText, fontSize, fontFamily);

      if (lineWidth > maxWidth) {
        const spacesInLine = lineText.split(" ").length - 1;
        const lineWithWords = words.splice(0, spacesInLine).join(" ");

        if (
          lines.length === 1 &&
          spacesInLine > 0 &&
          lines[0] !== lineWithWords
        ) {
          lines[0] = lineText.slice(0, lineWithWords.length);
          lines.push(lineText.slice(lineWithWords.length));
        } else {
          lines.push(character);
        }
      } else {
        lines[lineIndex] = lineText;
      }
    });
  }

  return {
    lines,
    width: Math.min(maxWidth, totalWidth),
  };
};
