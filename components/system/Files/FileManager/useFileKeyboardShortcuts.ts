import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import type {
  Files,
  FolderActions,
} from "components/system/Files/FileManager/useFolder";
import type { FileManagerViewNames } from "components/system/Files/Views";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { dirname, join } from "path";
import { PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";

type KeyboardShortcutEntry = (file?: string) => React.KeyboardEventHandler;

const useFileKeyboardShortcuts = (
  files: Files,
  url: string,
  focusedEntries: string[],
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  { blurEntry, focusEntry }: FocusEntryFunctions,
  { pasteToFolder }: FolderActions,
  updateFiles: (newFile?: string, oldFile?: string) => void,
  id?: string,
  view?: FileManagerViewNames
): KeyboardShortcutEntry => {
  const { copyEntries, deletePath, moveEntries } = useFileSystem();
  const { url: changeUrl } = useProcesses();

  return (file?: string): React.KeyboardEventHandler =>
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
            haltEvent(event);
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

                await deletePath(path);
                updateFiles(undefined, path);
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
              target.dispatchEvent(
                new MouseEvent("dblclick", { bubbles: true })
              );
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

              (movedElement?.closest("button") || targetElement)?.click();
            }
        }
      }
    };
};

export default useFileKeyboardShortcuts;
