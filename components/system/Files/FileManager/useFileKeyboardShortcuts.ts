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

        if (lKey === "a") {
          haltEvent(event);
          if (target instanceof HTMLOListElement) {
            const [firstEntry] = target.querySelectorAll("button");

            firstEntry?.focus(PREVENT_SCROLL);
          }
          Object.keys(files).forEach((fileName) => focusEntry(fileName));
        } else if (lKey === "c") {
          haltEvent(event);
          copyEntries(focusedEntries.map((entry) => join(url, entry)));
        } else if (lKey === "x") {
          haltEvent(event);
          moveEntries(focusedEntries.map((entry) => join(url, entry)));
        } else if (lKey === "v") {
          haltEvent(event);
          pasteToFolder();
        }
      } else if (key === "F2" && file) {
        haltEvent(event);
        setRenaming(file);
      } else if (key === "F5" && id) {
        haltEvent(event);
        updateFiles();
      } else if (key === "Delete" && focusedEntries.length > 0) {
        haltEvent(event);
        focusedEntries.forEach(async (entry) => {
          const path = join(url, entry);

          await deletePath(path);
          updateFiles(undefined, path);
        });
        blurEntry();
      } else if (key === "Backspace" && id) {
        haltEvent(event);
        changeUrl(id, dirname(url));
      } else if (key.startsWith("Arrow")) {
        haltEvent(event);

        if (!(target instanceof HTMLElement)) return;

        let targetElement = target;

        if (!(target instanceof HTMLButtonElement)) {
          targetElement = target.querySelector("button") as HTMLButtonElement;
          if (!targetElement) return;
        }

        const { x, y, height, width } = targetElement.getBoundingClientRect();
        const movedElement =
          key === "ArrowUp" || key === "ArrowDown"
            ? document.elementFromPoint(
                x,
                y + (key === "ArrowUp" ? -height : height * 2)
              )
            : document.elementFromPoint(
                x + (key === "ArrowLeft" ? -width : width * 2),
                y
              );

        movedElement?.closest("button")?.click();
      } else if (target instanceof HTMLButtonElement && key === "Enter") {
        haltEvent(event);
        target.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      }
    };
};

export default useFileKeyboardShortcuts;
