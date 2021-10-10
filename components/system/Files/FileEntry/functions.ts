import type { FSModule } from "browserfs/dist/node/core/FS";
import { monacoExtensions } from "components/apps/MonacoEditor/config";
import type { ExtensionType } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import type { FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import {
  FOLDER_ICON,
  UNKNOWN_ICON,
} from "components/system/Files/FileManager/useFolder";
import processDirectory from "contexts/process/directory";
import ini from "ini";
import { extname, join } from "path";
import {
  BASE_2D_CONTEXT_OPTIONS,
  EMPTY_BUFFER,
  IMAGE_FILE_EXTENSIONS,
  MP3_MIME_TYPE,
  ONE_TIME_PASSIVE_EVENT,
  PREVIEW_FRAME_SECOND,
  SHORTCUT_EXTENSION,
  SHORTCUT_ICON,
  SYSTEM_FILES,
  SYSTEM_PATHS,
  VIDEO_FILE_EXTENSIONS,
} from "utils/constants";
import { bufferToUrl } from "utils/functions";

type InternetShortcut = {
  InternetShortcut: {
    BaseURL: string;
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

export const getIconFromIni = (
  fs: FSModule,
  directory: string
): Promise<string> =>
  new Promise((resolve) =>
    fs.readFile(
      join(directory, "desktop.ini"),
      (error, contents = EMPTY_BUFFER) => {
        if (!error) {
          const {
            ShellClassInfo: { IconFile = "" },
          } = ini.parse(contents.toString()) as ShellClassInfo;

          if (IconFile) resolve(IconFile);
        }
      }
    )
  );

const getDefaultFileViewer = (extension: string): string => {
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
      IconFile: icon = "",
      Type: type = "",
      URL: url = "",
    },
  } = ini.parse(contents.toString()) as InternetShortcut;

  if (!icon && pid) {
    return { icon: processDirectory[pid]?.icon, pid, type, url };
  }

  return { icon, pid, type, url };
};

export const getInfoWithoutExtension = (
  fs: FSModule,
  path: string,
  isDirectory: boolean,
  callback: (value: FileInfo) => void
): void => {
  if (isDirectory) {
    const setFolderInfo = (icon: string): void =>
      callback({ icon, pid: "FileExplorer", url: path });

    setFolderInfo(FOLDER_ICON);
    getIconFromIni(fs, path).then(setFolderInfo);
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
  const getInfoByFileExtension = (icon?: string): void =>
    callback({
      icon: icon || getIconByFileExtension(extension),
      pid: getProcessByFileExtension(extension),
      subIcons,
      url: path,
    });

  if (extension === SHORTCUT_EXTENSION) {
    fs.readFile(path, (error, contents = EMPTY_BUFFER) => {
      subIcons.push(SHORTCUT_ICON);

      if (error) {
        getInfoByFileExtension();
      } else {
        const { icon, pid, url } = getShortcutInfo(contents);
        const urlExt = extname(url);

        callback({ icon, pid, subIcons, url });

        if (pid === "FileExplorer") {
          getIconFromIni(fs, url).then((iniIcon) =>
            callback({ icon: iniIcon, pid, subIcons, url })
          );
        } else if (
          IMAGE_FILE_EXTENSIONS.has(urlExt) ||
          VIDEO_FILE_EXTENSIONS.has(urlExt) ||
          urlExt === ".mp3"
        ) {
          getInfoWithExtension(fs, url, urlExt, ({ icon: urlIcon }) => {
            if (urlIcon && urlIcon !== icon) {
              callback({ icon: urlIcon, pid, subIcons, url });
            }
          });
        }
      }
    });
  } else if (IMAGE_FILE_EXTENSIONS.has(extension)) {
    getInfoByFileExtension("/System/Icons/photo.png");
    fs.readFile(path, (error, contents = EMPTY_BUFFER) => {
      if (!error) getInfoByFileExtension(bufferToUrl(contents));
    });
  } else if (VIDEO_FILE_EXTENSIONS.has(extension)) {
    // eslint-disable-next-line dot-notation
    getInfoByFileExtension(processDirectory["VideoPlayer"].icon);
    fs.readFile(path, (error, contents = EMPTY_BUFFER) => {
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
    });
  } else if (extension === ".mp3") {
    getInfoByFileExtension(
      `/System/Icons/${extensions[".mp3"].icon as string}.png`
    );
    fs.readFile(path, (error, contents = EMPTY_BUFFER) => {
      if (!error) {
        import("music-metadata-browser").then(({ parseBuffer, selectCover }) =>
          parseBuffer(
            contents,
            {
              mimeType: MP3_MIME_TYPE,
              size: contents.length,
            },
            { skipPostHeaders: true }
          ).then(({ common: { picture } = {} }) => {
            const { data: coverPicture } = selectCover(picture) || {};

            if (coverPicture) getInfoByFileExtension(bufferToUrl(coverPicture));
          })
        );
      }
    });
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
): TextMetrics => {
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

  return canvasContexts[font].measureText(text);
};

export const getTextWrapData = (
  text: string,
  fontSize: string,
  fontFamily: string,
  maxWidth?: number
): WrapData => {
  const lines = [""];

  const { width: totalWidth } = measureText(text, fontSize, fontFamily);

  if (!maxWidth) return { lines: [text], width: totalWidth };

  if (totalWidth > maxWidth) {
    [...text].forEach((character) => {
      const lineCount = lines.length - 1;
      const lineText = `${lines[lineCount]}${character}`;
      const { width: lineWidth } = measureText(lineText, fontSize, fontFamily);

      if (lineWidth > maxWidth) {
        lines.push(character);
      } else {
        lines[lineCount] = lineText;
      }
    });
  }

  return {
    lines,
    width: Math.min(maxWidth, totalWidth),
  };
};
