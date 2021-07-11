import type { FSModule } from "browserfs/dist/node/core/FS";
import extensions from "components/system/Files/FileEntry/extensions";
import type { FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import processDirectory from "contexts/process/directory";
import ini from "ini";
import {
  IMAGE_FILE_EXTENSIONS,
  MP3_MIME_TYPE,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import { bufferToUrl } from "utils/functions";

const getIconByFileExtension = (extension: string): string => {
  const { icon: extensionIcon, process: [defaultProcess = ""] = [] } =
    extensions[extension] || {};

  if (extensionIcon) return `/icons/${extensionIcon}.png`;

  return processDirectory[defaultProcess]?.icon || "/icons/unknown.png";
};

const getProcessByFileExtension = (extension: string): string => {
  const [defaultProcess = ""] = extensions[extension]?.process || [];

  return defaultProcess;
};

const getShortcutInfo = (contents: Buffer) => {
  const {
    InternetShortcut: { BaseURL: pid = "", IconFile: icon = "", URL: url = "" },
  } = ini.parse(contents.toString());

  return { icon, pid, url };
};

export const getInfoWithoutExtension = (
  fs: FSModule,
  path: string,
  callback: React.Dispatch<React.SetStateAction<FileInfo>>
): void =>
  fs.stat(path, (_error, stats) => {
    const isDirectory = stats ? stats.isDirectory() : false;

    callback({
      icon: `/icons/${isDirectory ? "folder.png" : "unknown.png"}`,
      pid: isDirectory ? "FileExplorer" : "",
      url: path,
    });
  });

export const getInfoWithExtension = (
  fs: FSModule,
  path: string,
  extension: string,
  callback: React.Dispatch<React.SetStateAction<FileInfo>>
): void => {
  const getInfoByFileExtension = (icon?: string) =>
    callback({
      icon: icon || getIconByFileExtension(extension),
      pid: getProcessByFileExtension(extension),
      url: path,
    });

  if (extension === SHORTCUT_EXTENSION) {
    fs.readFile(path, (error, contents = Buffer.from("")) => {
      if (error) {
        getInfoByFileExtension();
      } else {
        callback(getShortcutInfo(contents));
      }
    });
  } else if (IMAGE_FILE_EXTENSIONS.has(extension)) {
    fs.readFile(path, (error, contents = Buffer.from("")) =>
      getInfoByFileExtension(error ? "/icons/photo.png" : bufferToUrl(contents))
    );
  } else if (extension === ".mp3") {
    fs.readFile(path, (error, contents = Buffer.from("")) =>
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

          getInfoByFileExtension(
            !error && coverPicture
              ? bufferToUrl(coverPicture)
              : "/icons/music.png"
          );
        })
      )
    );
  } else {
    getInfoByFileExtension();
  }
};
