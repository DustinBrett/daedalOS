import { basename } from "path";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Navigation from "components/apps/FileExplorer/Navigation";
import StyledFileExplorer from "components/apps/FileExplorer/StyledFileExplorer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { getIconFromIni } from "components/system/Files/FileEntry/functions";
import FileManager from "components/system/Files/FileManager";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import {
  COMPRESSED_FOLDER_ICON,
  FOLDER_ICON,
  MOUNTED_FOLDER_ICON,
  PREVENT_SCROLL,
  ROOT_NAME,
} from "utils/constants";
import { haltEvent } from "utils/functions";
import { getMountUrl, isMountedFolder } from "contexts/fileSystem/core";

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
  const addressBarRef = useRef<HTMLInputElement | null>(null);
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const directoryName = basename(url);
  const mountUrl = getMountUrl(url, rootFs?.mntMap || {});
  const onKeyDown = useCallback((event: KeyboardEvent): void => {
    const eventKey = event.key.toUpperCase();

    if (event.altKey && eventKey === "D") {
      haltEvent(event);
      addressBarRef.current?.focus(PREVENT_SCROLL);
    } else if (
      eventKey === "F3" ||
      (event.ctrlKey && (eventKey === "E" || eventKey === "F"))
    ) {
      haltEvent(event);
      searchBarRef.current?.focus(PREVENT_SCROLL);
    } else {
      const fileManagerEntry = (event?.target as HTMLElement)?.querySelector(
        "ol li button"
      );

      fileManagerEntry?.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          ctrlKey: event.ctrlKey,
          key: event.key,
          shiftKey: event.shiftKey,
        })
      );
    }
  }, []);

  useEffect(() => {
    if (url) {
      title(id, directoryName || ROOT_NAME);

      if (
        !icon ||
        url !== currentUrl ||
        (mountUrl && icon !== MOUNTED_FOLDER_ICON) ||
        icon === FOLDER_ICON
      ) {
        if (mountUrl && url === mountUrl) {
          setProcessIcon(
            id,
            isMountedFolder(rootFs?.mntMap[url])
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
    mountUrl,
    rootFs?.mntMap,
    setProcessIcon,
    title,
    url,
  ]);

  useEffect(() => {
    if (componentWindow && !closing && !url) {
      setProcessUrl(id, "/");
      setProcessIcon(id, "/System/Icons/pc.webp");
    }
  }, [closing, id, componentWindow, setProcessIcon, setProcessUrl, url]);

  useEffect(() => {
    componentWindow?.addEventListener("keydown", onKeyDown, {
      capture: true,
    });

    return () =>
      componentWindow?.removeEventListener("keydown", onKeyDown, {
        capture: true,
      });
  }, [componentWindow, onKeyDown]);

  return url ? (
    <StyledFileExplorer>
      <Navigation
        addressBarRef={addressBarRef}
        hideSearch={Boolean(mountUrl)}
        id={id}
        searchBarRef={searchBarRef}
      />
      <FileManager id={id} url={url} showStatusBar />
    </StyledFileExplorer>
  ) : // eslint-disable-next-line unicorn/no-null
  null;
};

export default memo(FileExplorer);
