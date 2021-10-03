import {
  getInfoWithExtension,
  getInfoWithoutExtension,
} from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { extname } from "path";
import { useEffect, useState } from "react";

export type FileInfo = {
  icon: string;
  subIcons?: string[];
  pid: string;
  type?: string;
  url: string;
};

const useFileInfo = (path: string, isDirectory: boolean): FileInfo => {
  const [info, setInfo] = useState<FileInfo>({
    icon: "",
    pid: "",
    url: "",
  });
  const { fs } = useFileSystem();

  useEffect(() => {
    if (fs) {
      const extension = extname(path).toLowerCase();

      if (!extension || isDirectory) {
        getInfoWithoutExtension(fs, path, isDirectory, setInfo);
      } else {
        getInfoWithExtension(fs, path, extension, setInfo);
      }
    }
  }, [fs, isDirectory, path]);

  return info;
};

export default useFileInfo;
