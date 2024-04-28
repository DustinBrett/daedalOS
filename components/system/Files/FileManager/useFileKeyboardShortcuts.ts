import { dirname, join } from "path";
import { useCallback, useEffect } from "react";
import useTransferDialog from "components/system/Dialogs/Transfer/useTransferDialog";
import { createFileReaders } from "components/system/Files/FileManager/functions";
import { type FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import {
  type Files,
  type FolderActions,
} from "components/system/Files/FileManager/useFolder";
import { type FileManagerViewNames } from "components/system/Files/Views";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { DESKTOP_PATH, PREVENT_SCROLL } from "utils/constants";
import { haltEvent, sendMouseClick } from "utils/functions";

type KeyboardShortcutEntry = (file?: string) => React.KeyboardEventHandler;

const useFileKeyboardShortcuts = (
  files: Files,
  url: string,
  focusedEntries: string[],
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  { blurEntry, focusEntry }: FocusEntryFunctions,
  { newPath, pasteToFolder }: FolderActions,
  updateFiles: (newFile?: string, oldFile?: string) => void,
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>,
  id?: string,
  view?: FileManagerViewNames
): KeyboardShortcutEntry => {
  const { copyEntries, deletePath, moveEntries } = useFileSystem();
  const { url: changeUrl } = useProcesses();
  const { openTransferDialog } = useTransferDialog();
  const { foregroundId } = useSession();

  useEffect(() => {
    const pasteHandler = (event: ClipboardEvent): void => {
      if (
        event.clipboardData?.files?.length &&
        ((!foregroundId && url === DESKTOP_PATH) || foregroundId === id)
      ) {
        event.stopImmediatePropagation?.();
        createFileReaders(event.clipboardData.files, url, newPath).then(
          openTransferDialog
        );
      }
    };

    document.addEventListener("paste", pasteHandler);

    return () => document.removeEventListener("paste", pasteHandler);
  }, [foregroundId, id, newPath, openTransferDialog, url]);

  return useCallback(
    (file?: string): React.KeyboardEventHandler =>
      (event) => {
        if (view === "list") return;

        const { ctrlKey, key, target, shiftKey } = event;

        if (shiftKey) return;

        if (ctrlKey) {
          const lKey = key.toLowerCase();

          // eslint-disable-next-line default-case
          switch (lKey) {
            case "a":
              haltEvent(event);
              if (target instanceof HTMLOListElement) {
                const [firstEntry] = target.querySelectorAll("button");

                firstEntry?.focus(PREVENT_SCROLL);
              }
              Object.keys(files).forEach((fileName) => focusEntry(fileName));
              break;
            case "c":
              haltEvent(event);
              copyEntries(focusedEntries.map((entry) => join(url, entry)));
              break;
            case "x":
              haltEvent(event);
              moveEntries(focusedEntries.map((entry) => join(url, entry)));
              break;
            case "v":
              event.stopPropagation();
              pasteToFolder();
              break;
          }
        } else {
          switch (key) {
            case "F2":
              if (file) {
                haltEvent(event);
                setRenaming(file);
              }
              break;
            case "F5":
              if (id) {
                haltEvent(event);
                updateFiles();
              }
              break;
            case "Delete":
              if (focusedEntries.length > 0) {
                haltEvent(event);
                focusedEntries.forEach(async (entry) => {
                  const path = join(url, entry);

                  if (await deletePath(path)) updateFiles(undefined, path);
                });
                blurEntry();
              }
              break;
            case "Backspace":
              if (id) {
                haltEvent(event);
                changeUrl(id, dirname(url));
              }
              break;
            case "Enter":
              if (target instanceof HTMLButtonElement) {
                haltEvent(event);
                sendMouseClick(target, 2);
              }
              break;
            default:
              if (key.startsWith("Arrow")) {
                haltEvent(event);

                if (!(target instanceof HTMLElement)) return;

                let targetElement = target;

                if (!(target instanceof HTMLButtonElement)) {
                  targetElement = target.querySelector(
                    "button"
                  ) as HTMLButtonElement;
                  if (!targetElement) return;
                }

                const { x, y, height, width } =
                  targetElement.getBoundingClientRect();
                let movedElement =
                  key === "ArrowUp" || key === "ArrowDown"
                    ? document.elementFromPoint(
                        x,
                        y + (key === "ArrowUp" ? -height : height * 2)
                      )
                    : document.elementFromPoint(
                        x + (key === "ArrowLeft" ? -width : width * 2),
                        y
                      );

                if (movedElement instanceof HTMLOListElement) {
                  const nearestLi = targetElement.closest("li");

                  if (nearestLi instanceof HTMLLIElement) {
                    const olChildren = [...movedElement.children];
                    const liPosition = olChildren.indexOf(nearestLi);

                    if (key === "ArrowUp" || key === "ArrowDown") {
                      movedElement =
                        olChildren[
                          key === "ArrowUp"
                            ? liPosition === 0
                              ? olChildren.length - 1
                              : liPosition - 1
                            : liPosition === olChildren.length - 1
                              ? 0
                              : liPosition + 1
                        ].querySelector("button");
                    }
                  }
                }

                const closestButton = movedElement?.closest("button");
                let dispatchElement: HTMLElement = closestButton as HTMLElement;

                if (
                  !(closestButton instanceof HTMLButtonElement) ||
                  !fileManagerRef.current?.contains(closestButton)
                ) {
                  dispatchElement = targetElement;
                }

                dispatchElement?.dispatchEvent(
                  new MouseEvent("mousedown", {
                    bubbles: true,
                  })
                );
              } else if (/^[\da-z]$/i.test(key)) {
                haltEvent(event);

                const fileNames = Object.keys(files);
                const lastFocusedEntryIndex = fileNames.indexOf(
                  focusedEntries[focusedEntries.length - 1]
                );
                const lowerCaseKey = key.toLowerCase();
                const upperCaseKey = key.toUpperCase();
                const fileNamesStartingFromLastFocusedEntry = [
                  ...fileNames.slice(lastFocusedEntryIndex),
                  ...fileNames.slice(0, lastFocusedEntryIndex),
                ];
                const focusOnEntry = fileNamesStartingFromLastFocusedEntry.find(
                  (name) =>
                    !focusedEntries.includes(name) &&
                    (name.startsWith(lowerCaseKey) ||
                      name.startsWith(upperCaseKey))
                );

                if (focusOnEntry) {
                  blurEntry();
                  focusEntry(focusOnEntry);
                  fileManagerRef.current
                    ?.querySelector(`button[aria-label='${focusOnEntry}']`)
                    ?.scrollIntoView();
                }
              }
          }
        }
      },
    [
      blurEntry,
      changeUrl,
      copyEntries,
      deletePath,
      fileManagerRef,
      files,
      focusEntry,
      focusedEntries,
      id,
      moveEntries,
      pasteToFolder,
      setRenaming,
      updateFiles,
      url,
      view,
    ]
  );
};

export default useFileKeyboardShortcuts;
