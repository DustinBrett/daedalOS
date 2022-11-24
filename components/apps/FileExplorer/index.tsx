import Navigation from "components/apps/FileExplorer/Navigation";
import StyledFileExplorer from "components/apps/FileExplorer/StyledFileExplorer";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { getIconFromIni } from "components/system/Files/FileEntry/functions";
import FileManager from "components/system/Files/FileManager";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  COMPRESSED_FOLDER_ICON,
  MOUNTED_FOLDER_ICON,
  PREVENT_SCROLL,
  ROOT_NAME,
} from "utils/constants";
import { haltEvent } from "utils/functions";

const FileExplorer: FC<ComponentProcessProps> = ({ id }) => {
  const {
    icon: setProcessIcon,
    title,
    processes: { [id]: process },
    url: setProcessUrl,
  } = useProcesses();
  const { componentWindow, closing, icon = "", url = "" } = process || {};
  const { fs, rootFs } = useFileSystem();
  const [currentUrl, setCurrentUrl] = useState(url);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const directoryName = basename(url);
  const isMounted = Boolean(rootFs?.mntMap[url] && directoryName);
  const onKeyDown = useCallback((event: KeyboardEvent): void => {
    if (event.altKey && event.key.toUpperCase() === "D") {
      haltEvent(event);
      inputRef?.current?.focus(PREVENT_SCROLL);
    }
  }, []);

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

  useEffect(() => {
    if (process && !closing && !url) {
      setProcessUrl(id, "/");
      setProcessIcon(id, "/System/Icons/pc.webp");
    }
  }, [closing, id, process, setProcessIcon, setProcessUrl, url]);

  useEffect(() => {
    componentWindow?.addEventListener("keydown", onKeyDown);

    return () => componentWindow?.removeEventListener("keydown", onKeyDown);
  }, [componentWindow, onKeyDown]);

  return url ? (
    <StyledFileExplorer>
      <Navigation ref={inputRef} hideSearch={isMounted} id={id} />
      <FileManager id={id} url={url} view="icon" showStatusBar />
    </StyledFileExplorer>
  ) : // eslint-disable-next-line unicorn/no-null
  null;
};

export default FileExplorer;
