import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import type {
  Files,
  FolderActions,
} from "components/system/Files/FileManager/useFolder";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { dirname, join } from "path";
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
  id?: string
): KeyboardShortcutEntry => {
  const { copyEntries, deletePath, moveEntries } = useFileSystem();
  const { url: changeUrl } = useProcesses();

  return (file?: string): React.KeyboardEventHandler =>
    (event) => {
      const { ctrlKey, key, target, shiftKey } = event;

      if (key === "F12" && !shiftKey) return;

      haltEvent(event);

      if (ctrlKey) {
        const lKey = key.toLowerCase();

        if (lKey === "a") {
          if (target instanceof HTMLOListElement) {
            const [firstEntry] = target.querySelectorAll("button");

            firstEntry?.focus();
          }
          Object.keys(files).forEach((fileName) => focusEntry(fileName));
        } else if (lKey === "c") {
          copyEntries(focusedEntries.map((entry) => join(url, entry)));
        } else if (lKey === "x") {
          moveEntries(focusedEntries.map((entry) => join(url, entry)));
        } else if (lKey === "v") {
          pasteToFolder();
        }
      } else if (key === "F2" && file) {
        setRenaming(file);
      } else if (key === "F5") {
        updateFiles();
      } else if (key === "Delete") {
        focusedEntries.forEach(async (entry) => {
          const path = join(url, entry);

          await deletePath(path);
          updateFiles(undefined, path);
        });

        blurEntry();
      } else if (key === "Backspace" && id) {
        changeUrl(id, dirname(url));
      } else if (target instanceof HTMLButtonElement) {
        if (key === "Enter") {
          target.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
        } else if (key.startsWith("Arrow")) {
          const { x, y, height, width } = target.getBoundingClientRect();
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
        }
      }
    };
};

export default useFileKeyboardShortcuts;
