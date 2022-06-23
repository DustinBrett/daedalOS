import Navigation from "components/apps/FileExplorer/Navigation";
import StyledFileExplorer from "components/apps/FileExplorer/StyledFileExplorer";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { getIconFromIni } from "components/system/Files/FileEntry/functions";
import FileManager from "components/system/Files/FileManager";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useEffect, useState } from "react";
import {
  COMPRESSED_FOLDER_ICON,
  MOUNTED_FOLDER_ICON,
  ROOT_NAME,
} from "utils/constants";

const FileExplorer: FC<ComponentProcessProps> = ({ id }) => {
  const {
    icon: setProcessIcon,
    title,
    processes: { [id]: process },
    url: setProcessUrl,
  } = useProcesses();
  const { icon = "", url = "" } = process || {};
  const { fs, rootFs } = useFileSystem();
  const [currentUrl, setCurrentUrl] = useState(url);
  const directoryName = basename(url);
  const isMounted = Boolean(rootFs?.mntMap[url] && directoryName);

  useEffect(() => {
    if (url) {
      title(id, directoryName || ROOT_NAME);

      if (
        !icon ||
        url !== currentUrl ||
        (isMounted && icon !== MOUNTED_FOLDER_ICON)
      ) {
        if (isMounted) {
          setProcessIcon(
            id,
            rootFs?.mntMap[url].getName() === "FileSystemAccess"
              ? MOUNTED_FOLDER_ICON
              : COMPRESSED_FOLDER_ICON
          );
        } else if (fs) {
          setProcessIcon(
            id,
            `/System/Icons/${directoryName ? "folder" : "pc"}.webp`
          );
          getIconFromIni(fs, url).then((iconFile) => {
            if (iconFile) setProcessIcon(id, iconFile);
          });
        }

        setCurrentUrl(url);
      }
    } else {
      setProcessUrl(id, "/");
      setProcessIcon(id, "/System/Icons/pc.webp");
    }
  }, [
    currentUrl,
    directoryName,
    fs,
    icon,
    id,
    isMounted,
    rootFs?.mntMap,
    setProcessIcon,
    setProcessUrl,
    title,
    url,
  ]);

  return url ? (
    <StyledFileExplorer>
      <Navigation hideSearch={isMounted} id={id} />
      <FileManager id={id} url={url} view="icon" showStatusBar />
    </StyledFileExplorer>
  ) : (
    <></>
  );
};

export default FileExplorer;
