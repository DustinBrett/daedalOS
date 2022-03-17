import type { FSModule } from "browserfs/dist/node/core/FS";
import { monacoExtensions } from "components/apps/MonacoEditor/extensions";
import type { ExtensionType } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import type { FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import type { FileStat } from "components/system/Files/FileManager/functions";
import type { RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import processDirectory from "contexts/process/directory";
import ini from "ini";
import { extname, join } from "path";
import index from "public/.index/fs.9p.json";
import {
  BASE_2D_CONTEXT_OPTIONS,
  FOLDER_ICON,
  IMAGE_FILE_EXTENSIONS,
  MOUNTED_FOLDER_ICON,
  MP3_MIME_TYPE,
  NEW_FOLDER_ICON,
  ONE_TIME_PASSIVE_EVENT,
  PREVIEW_FRAME_SECOND,
  SHORTCUT_EXTENSION,
  SHORTCUT_ICON,
  SYSTEM_FILES,
  SYSTEM_PATHS,
  UNKNOWN_ICON,
  VIDEO_FILE_EXTENSIONS,
} from "utils/constants";
import { bufferToUrl, isYouTubeUrl } from "utils/functions";

type InternetShortcut = {
  InternetShortcut: {
    BaseURL: string;
    Comment: string;
    IconFile: string;
    Type: string;
    URL: string;
  };
};

type ShellClassInfo = {
  ShellClassInfo: {
    IconFile: string;
  };
};

type FS9P = [string, number, number, number, number, number, FS9P[] | string];

const IDX_MTIME = 2;
const IDX_TARGET = 6;

const get9pModifiedTime = (path: string): number => {
  let fsPath = index.fsroot as FS9P[];
  let mTime = 0;

  path
    .split("/")
    .filter(Boolean)
    .forEach((pathPart) => {
      const pathBranch = fsPath.find(([name]) => name === pathPart);

      if (pathBranch) {
        const isBranch = Array.isArray(pathBranch[IDX_TARGET]);

        if (!isBranch) mTime = pathBranch[IDX_MTIME];
        fsPath = isBranch ? (pathBranch[IDX_TARGET] as FS9P[]) : [];
      }
    });

  return mTime;
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
        if (!error) {
          const {
            ShellClassInfo: { IconFile = "" },
          } = ini.parse(contents.toString()) as ShellClassInfo;

          if (IconFile) resolve(IconFile);
        }
      }
    );
  });

export const getDefaultFileViewer = (extension: string): string => {
  if (monacoExtensions.has(extension)) return "MonacoEditor";
  if (IMAGE_FILE_EXTENSIONS.has(extension)) return "Photos";
  if (VIDEO_FILE_EXTENSIONS.has(extension)) return "VideoPlayer";

  return "";
};

export const getIconByFileExtension = (extension: string): string => {
  const { icon: extensionIcon = "", process: [defaultProcess = ""] = [] } =
    extension in extensions ? extensions[extension as ExtensionType] : {};

  if (extensionIcon) return `/System/Icons/${extensionIcon}.png`;

  return (
    processDirectory[defaultProcess || getDefaultFileViewer(extension)]?.icon ||
    UNKNOWN_ICON
  );
};

export const getProcessByFileExtension = (extension: string): string => {
  const [defaultProcess = ""] =
    extension in extensions
      ? extensions[extension as ExtensionType].process
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
  } = ini.parse(contents.toString()) as InternetShortcut;

  if (!icon && pid) {
    return { comment, icon: processDirectory[pid]?.icon, pid, type, url };
  }

  return { comment, icon, pid, type, url };
};

export const getInfoWithoutExtension = (
  fs: FSModule,
  rootFs: RootFileSystem,
  path: string,
  isDirectory: boolean,
  useNewFolderIcon: boolean,
  callback: (value: FileInfo) => void
): void => {
  if (isDirectory) {
    const setFolderInfo = (icon: string, getIcon?: () => void): void =>
      callback({ getIcon, icon, pid: "FileExplorer", url: path });
    const getFolderIcon = (): string => {
      if (rootFs?.mntMap[path]) return MOUNTED_FOLDER_ICON;
      if (useNewFolderIcon) return NEW_FOLDER_ICON;
      return FOLDER_ICON;
    };

    setFolderInfo(getFolderIcon(), () =>
      getIconFromIni(fs, path).then(setFolderInfo)
    );
  } else {
    callback({ icon: UNKNOWN_ICON, pid: "", url: "" });
  }
};

export const getInfoWithExtension = (
  fs: FSModule,
  path: string,
  extension: string,
  callback: (value: FileInfo) => void
): void => {
  const subIcons: string[] = [];
  const getInfoByFileExtension = (icon?: string, getIcon?: () => void): void =>
    callback({
      getIcon,
      icon: icon || getIconByFileExtension(extension),
      pid: getProcessByFileExtension(extension),
      subIcons,
      url: path,
    });

  if (extension === SHORTCUT_EXTENSION) {
    fs.readFile(path, (error, contents = Buffer.from("")) => {
      subIcons.push(SHORTCUT_ICON);

      if (error) {
        getInfoByFileExtension();
      } else {
        const { comment, icon, pid, url } = getShortcutInfo(contents);
        const urlExt = extname(url).toLowerCase();

        if (pid === "FileExplorer") {
          const getIcon = (): void => {
            getIconFromIni(fs, url).then((iniIcon) =>
              callback({ comment, icon: iniIcon, pid, subIcons, url })
            );
          };

          callback({ comment, getIcon, icon, pid, subIcons, url });
        } else if (
          IMAGE_FILE_EXTENSIONS.has(urlExt) ||
          VIDEO_FILE_EXTENSIONS.has(urlExt) ||
          urlExt === ".mp3"
        ) {
          getInfoWithExtension(fs, url, urlExt, (fileInfo) => {
            const {
              icon: urlIcon = icon,
              getIcon,
              subIcons: fileSubIcons = [],
            } = fileInfo;

            if (fileSubIcons.length > 0) {
              subIcons.push(
                ...fileSubIcons.filter((subIcon) => !subIcons.includes(subIcon))
              );
            }

            callback({ comment, getIcon, icon: urlIcon, pid, subIcons, url });
          });
        } else if (isYouTubeUrl(url)) {
          callback({
            comment,
            icon: `https://img.youtube.com/vi${new URL(url).pathname}/1.jpg`,
            pid,
            subIcons: [processDirectory["VideoPlayer"].icon],
            url,
          });
        } else {
          callback({ comment, icon, pid, subIcons, url });
        }
      }
    });
  } else if (IMAGE_FILE_EXTENSIONS.has(extension)) {
    getInfoByFileExtension("/System/Icons/photo.png", () =>
      fs.readFile(path, (error, contents = Buffer.from("")) => {
        if (!error && contents.length > 0) {
          getInfoByFileExtension(bufferToUrl(contents));
        }
      })
    );
  } else if (VIDEO_FILE_EXTENSIONS.has(extension)) {
    subIcons.push(processDirectory["VideoPlayer"].icon);
    getInfoByFileExtension(processDirectory["VideoPlayer"].icon, () =>
      fs.readFile(path, (error, contents = Buffer.from("")) => {
        if (!error) {
          const video = document.createElement("video");

          video.currentTime = PREVIEW_FRAME_SECOND;
          video.addEventListener(
            "loadeddata",
            () => {
              const canvas = document.createElement("canvas");

              canvas.height = video.videoHeight;
              canvas.width = video.videoWidth;
              canvas
                .getContext("2d", BASE_2D_CONTEXT_OPTIONS)
                ?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
              canvas.toBlob((blob) => {
                if (blob instanceof Blob) {
                  getInfoByFileExtension(URL.createObjectURL(blob));
                }
              });
            },
            ONE_TIME_PASSIVE_EVENT
          );
          video.src = bufferToUrl(contents);
          video.load();
        }
      })
    );
  } else if (extension === ".mp3") {
    getInfoByFileExtension(
      `/System/Icons/${extensions[".mp3"].icon as string}.png`,
      () =>
        fs.readFile(path, (error, contents = Buffer.from("")) => {
          if (!error) {
            import("music-metadata-browser").then(
              ({ parseBuffer, selectCover }) =>
                parseBuffer(
                  contents,
                  {
                    mimeType: MP3_MIME_TYPE,
                    size: contents.length,
                  },
                  { skipPostHeaders: true }
                ).then(({ common: { picture } = {} }) => {
                  const { data: coverPicture } = selectCover(picture) || {};

                  if (coverPicture) {
                    getInfoByFileExtension(bufferToUrl(coverPicture));
                  }
                })
            );
          }
        })
    );
  } else {
    getInfoByFileExtension();
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

const canvasContexts: Record<string, CanvasRenderingContext2D> = {};

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
