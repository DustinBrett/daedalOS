import { basename } from "path";
import { useEffect, useRef } from "react";
import Navigation from "components/apps/FileExplorer/Navigation";
import StyledFileExplorer from "components/apps/FileExplorer/StyledFileExplorer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { getIconFromIni } from "components/system/Files/FileEntry/functions";
import FileManager from "components/system/Files/FileManager";
import { useFs, useRootFs } from "contexts/fileSystem";
import { getMountUrl, isMountedFolder } from "contexts/fileSystem/core";
import { useProcess, useProcessesActions } from "contexts/process";
import {
  COMPRESSED_FOLDER_ICON,
  FOLDER_ICON,
  MOUNTED_FOLDER_ICON,
  PREVENT_SCROLL,
  ROOT_NAME,
} from "utils/constants";
import { haltEvent } from "utils/functions";
import { isEditableElement } from "utils/keyboard";

const NAVIGATION_BUTTONS: Record<string, string> = {
  ARROWLEFT: "back",
  ARROWRIGHT: "forward",
  ARROWUP: "up",
};

const FileExplorer: FC<ComponentProcessProps> = ({ id }) => {
  const {
    icon: setProcessIcon,
    title,
    url: setProcessUrl,
  } = useProcessesActions();
  const { closing, componentWindow, icon = "", url = "" } = useProcess(id);
  const fs = useFs();
  const rootFs = useRootFs();
  const currentUrl = useRef(url);
  const addressBarRef = useRef<HTMLInputElement | null>(null);
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const directoryName = basename(url);
  const mountUrl = getMountUrl(url, rootFs?.mntMap || {});
  const onKeyDown = (event: KeyboardEvent): void => {
    const eventKey = event.key.toUpperCase();
    // Text boxes keep these, which move by word on a Mac
    const navigationButton =
      event.altKey &&
      !isEditableElement(event.target) &&
      NAVIGATION_BUTTONS[eventKey];

    if (navigationButton) {
      haltEvent(event);
      componentWindow
        ?.querySelector<HTMLButtonElement>(`nav > button.${navigationButton}`)
        ?.click();
    } else if (event.altKey && eventKey === "D") {
      haltEvent(event);
      addressBarRef.current?.focus(PREVENT_SCROLL);
    } else if (
      eventKey === "F3" ||
      (event.ctrlKey && (eventKey === "E" || eventKey === "F"))
    ) {
      haltEvent(event);
      searchBarRef.current?.focus(PREVENT_SCROLL);
    } else if (
      event.target === componentWindow &&
      // The Menu key on the window already opens the menu of its items
      eventKey !== "CONTEXTMENU" &&
      // Like Explorer, keys on the window go to its items
      componentWindow.querySelector("ol[tabindex]")?.dispatchEvent(
        new KeyboardEvent("keydown", {
          altKey: event.altKey,
          bubbles: true,
          cancelable: true,
          code: event.code,
          ctrlKey: event.ctrlKey,
          key: event.key,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
        })
      ) === false
    ) {
      // What the items did with a key, like F5, the page mustn't do too
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (url) {
      title(id, directoryName || ROOT_NAME);

      if (
        !icon ||
        url !== currentUrl.current ||
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

        currentUrl.current = url;
      }
    }
  }, [
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

export default FileExplorer;
