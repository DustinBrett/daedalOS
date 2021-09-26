import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { getIconFromIni } from "components/system/Files/FileEntry/functions";
import FileManager from "components/system/Files/FileManager";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useEffect } from "react";

const FileExplorer = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    icon: setProcessIcon,
    title,
    processes: { [id]: process },
  } = useProcesses();
  const { closing = false, icon = "", url = "" } = process || {};
  const { fs } = useFileSystem();

  useEffect(() => {
    const directoryName = basename(url);

    if (url) {
      title(id, directoryName || "My PC");

      if (!icon && fs) {
        setProcessIcon(
          id,
          `/System/Icons/${directoryName ? "folder" : "pc"}.png`
        );
        getIconFromIni(fs, url).then((iconFile) =>
          setProcessIcon(id, iconFile)
        );
      }
    }
  }, [fs, icon, id, setProcessIcon, title, url]);

  return url ? <FileManager closing={closing} url={url} view="icon" /> : <></>;
};

export default FileExplorer;
