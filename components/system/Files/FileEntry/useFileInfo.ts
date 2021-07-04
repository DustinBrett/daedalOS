import {
  getInfoWithExtension,
  getInfoWithoutExtension,
} from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { extname } from "path";
import { useEffect, useState } from "react";

export type FileInfo = {
  icon: string;
  pid: string;
  url: string;
};

const useFileInfo = (path: string): FileInfo => {
  const [info, setInfo] = useState<FileInfo>({
    icon: "",
    pid: "",
    url: "",
  });
  const { fs } = useFileSystem();

  useEffect(() => {
    if (fs) {
      const extension = extname(path).toLowerCase();

      if (!extension) {
        getInfoWithoutExtension(fs, path, setInfo);
      } else {
        getInfoWithExtension(fs, path, extension, setInfo);
      }
    }
  }, [fs, path]);

  return info;
};

export default useFileInfo;
