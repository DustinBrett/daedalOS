import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { getIconFromIni } from "components/system/Files/FileEntry/functions";
import FileManager from "components/system/Files/FileManager";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useEffect, useState } from "react";

const FileExplorer = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    icon: setProcessIcon,
    title,
    processes: { [id]: process },
  } = useProcesses();
  const { closing = false, icon = "", url = "" } = process || {};
  const { fs } = useFileSystem();
  const [currentUrl, setCurrentUrl] = useState(url);

  useEffect(() => {
    const directoryName = basename(url);

    if (url) {
      title(id, directoryName || "My PC");

      if (fs && (!icon || url !== currentUrl)) {
        setProcessIcon(
          id,
          `/System/Icons/${directoryName ? "folder" : "pc"}.png`
        );
        getIconFromIni(fs, url).then((iconFile) =>
          setProcessIcon(id, iconFile)
        );
        setCurrentUrl(url);
      }
    }
  }, [currentUrl, fs, icon, id, setProcessIcon, title, url]);

  return url ? (
    <FileManager closing={closing} id={id} url={url} view="icon" />
  ) : (
    <></>
  );
};

export default FileExplorer;
