import {
  getInfoWithExtension,
  getInfoWithoutExtension,
} from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { extname } from "path";
import { useEffect, useRef, useState } from "react";
import { MOUNTABLE_EXTENSIONS } from "utils/constants";

export type FileInfo = {
  comment?: string;
  getIcon?: true | ((signal: AbortSignal) => void);
  icon: string;
  pid: string;
  subIcons?: string[];
  type?: string;
  url: string;
};

const useFileInfo = (
  path: string,
  isDirectory: boolean,
  useNewFolderIcon = false
): [FileInfo, React.Dispatch<React.SetStateAction<FileInfo>>] => {
  const [info, setInfo] = useState<FileInfo>(() => ({
    icon: "",
    pid: "",
    url: "",
  }));
  const updatingInfo = useRef(false);
  const updateInfo = (newInfo: FileInfo): void => {
    setInfo(newInfo);
    updatingInfo.current = false;
  };
  const { fs, rootFs } = useFileSystem();

  useEffect(() => {
    if (!updatingInfo.current && fs && rootFs) {
      updatingInfo.current = true;

      const extension = extname(path).toLowerCase();

      if (
        !extension ||
        (isDirectory &&
          !MOUNTABLE_EXTENSIONS.has(extension) &&
          rootFs.mntMap[path]?.getName() !== "FileSystemAccess")
      ) {
        getInfoWithoutExtension(
          fs,
          rootFs,
          path,
          isDirectory,
          useNewFolderIcon,
          updateInfo
        );
      } else {
        getInfoWithExtension(fs, path, extension, updateInfo);
      }
    }
  }, [fs, isDirectory, path, rootFs, useNewFolderIcon]);

  return [info, setInfo];
};

export default useFileInfo;
