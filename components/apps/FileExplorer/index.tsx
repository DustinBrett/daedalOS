import { ROOT_NAME } from "components/apps/FileExplorer/config";
import Navigation from "components/apps/FileExplorer/Navigation";
import StyledFileExplorer from "components/apps/FileExplorer/StyledFileExplorer";
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
  const { icon = "", url = "" } = process || {};
  const { fs } = useFileSystem();
  const [currentUrl, setCurrentUrl] = useState(url);

  useEffect(() => {
    const directoryName = basename(url);

    if (url) {
      title(id, directoryName || ROOT_NAME);

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
    <StyledFileExplorer>
      <Navigation id={id} />
      <FileManager id={id} url={url} view="icon" showStatusBar />
    </StyledFileExplorer>
  ) : (
    <></>
  );
};

export default FileExplorer;
