import { dirname, join } from "path";
import { useEffect, useRef } from "react";
import useTransferDialog from "components/system/Dialogs/Transfer/useTransferDialog";
import { createFileReaders } from "components/system/Files/FileManager/functions";
import { type FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import {
  type Files,
  type FolderActions,
} from "components/system/Files/FileManager/useFolder";
import { type FileManagerViewNames } from "components/system/Files/Views";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcessesActions } from "contexts/process";
import { useForegroundId, useSessionActions } from "contexts/session";
import {
  DESKTOP_PATH,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import {
  haltEvent,
  saveUnpositionedDesktopIcons,
  sendMouseClick,
} from "utils/functions";
import { isPrintableKey, scrollIntoList } from "utils/keyboard";

const TYPE_AHEAD_RESET_MS = 2000;

// Keys nothing here acts on, so finding the entry they came from is skipped
const IGNORED_KEYS = new Set(["Alt", "Control", "Meta", "Shift", "Tab"]);

const BACKWARD_KEYS = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);

// Ctrl+Shift+3 & 6, by key position as layouts shift them to other characters
const VIEW_KEYS: Record<string, FileManagerViewNames> = {
  Digit3: "icon",
  Digit6: "details",
};

// Finds the entry in the direction of the key, using the on-screen layout
const getNeighborIndex = (
  key: string,
  fromIndex: number,
  buttons: HTMLElement[],
  pageHeight = 0,
  columnFlow = false
): number => {
  const from = buttons[fromIndex].getBoundingClientRect();
  const vertical = !key.endsWith("Left") && !key.endsWith("Right");
  const direction = BACKWARD_KEYS.has(key) ? -1 : 1;
  // Paging goes as far as possible while keeping the entry in view, so within
  // a page the farthest entry wins, while otherwise the nearest one does
  const pageLimit = pageHeight - from.height;
  let bestIndex = -1;
  let bestScore = Number.POSITIVE_INFINITY;

  buttons.forEach((button, index) => {
    const rect = button.getBoundingClientRect();

    if (index === fromIndex || rect.width === 0) return;

    const distance = vertical
      ? (rect.top - from.top) * direction
      : (rect.left - from.left) * direction;
    const offset = vertical
      ? Math.abs(rect.left - from.left)
      : Math.abs(rect.top - from.top);
    const score = distance <= pageLimit ? pageLimit - distance : distance;

    if (
      distance > 1 &&
      offset < (vertical ? from.width : from.height) / 2 &&
      score < bestScore
    ) {
      bestIndex = index;
      bestScore = score;
    }
  });

  // Past the end of a column continues in the next one, but not past the ends
  if (bestIndex === -1 && vertical && !pageHeight && columnFlow) {
    bestIndex = Math.min(
      Math.max(fromIndex + direction, 0),
      buttons.length - 1
    );
  }

  return bestIndex === -1 ? fromIndex : bestIndex;
};

const clickEntryButton = (
  fileManagerRef: React.RefObject<HTMLOListElement | null>,
  entry: string
): void => {
  try {
    const entryButton = fileManagerRef.current?.querySelector(
      `button[aria-label='${CSS.escape(entry.replace(SHORTCUT_EXTENSION, ""))}']`
    );

    if (entryButton instanceof HTMLElement) {
      sendMouseClick(entryButton, 2);
    }
  } catch {
    // Ignore error getting entry button
  }
};

const useFileKeyboardShortcuts = (
  files: Files,
  url: string,
  focusedEntries: string[],
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  { blurEntry, focusEntry }: FocusEntryFunctions,
  { newPath, pasteToFolder }: FolderActions,
  updateFiles: (newFile?: string, oldFile?: string) => void,
  fileManagerRef: React.RefObject<HTMLOListElement | null>,
  id?: string,
  isStartMenu?: boolean,
  isDesktop?: boolean,
  setView?: (newView: FileManagerViewNames) => void
): React.KeyboardEventHandler => {
  const { copyEntries, deletePath, moveEntries } = useFileSystemActions();
  const { open, url: changeUrl } = useProcessesActions();
  const { openTransferDialog } = useTransferDialog();
  const { setIconPositions } = useSessionActions();
  const foregroundId = useForegroundId();
  const anchorEntryRef = useRef("");
  const typeAheadRef = useRef({ index: -1, text: "", time: 0 });

  useEffect(() => {
    const pasteHandler = (event: ClipboardEvent): void => {
      if (
        event.clipboardData?.files?.length &&
        ((!foregroundId && isDesktop) || foregroundId === id)
      ) {
        event.stopImmediatePropagation?.();
        createFileReaders(event.clipboardData.files, url, newPath).then(
          openTransferDialog
        );
      }
    };

    document.addEventListener("paste", pasteHandler);

    return () => document.removeEventListener("paste", pasteHandler);
  }, [foregroundId, id, isDesktop, newPath, openTransferDialog, url]);

  return (event) => {
    if (isStartMenu || IGNORED_KEYS.has(event.key)) return;

    const { key, metaKey, shiftKey, target } = event;
    // AltGr arrives as Ctrl+Alt, though it is typing a character
    const altGraph = event.getModifierState("AltGraph");
    const altKey = event.altKey && !altGraph;
    const ctrlKey = event.ctrlKey && !altGraph;
    const fileNames = Object.keys(files);
    const buttons = [
      ...(fileManagerRef.current?.querySelectorAll<HTMLButtonElement>(
        ":scope > li > button"
      ) || []),
    ];
    const targetIndex = buttons.findIndex((button) =>
      button.contains(target as Node)
    );
    const currentIndex =
      targetIndex === -1
        ? fileNames.indexOf(focusedEntries[focusedEntries.length - 1])
        : targetIndex;
    // Like Explorer, Shift extends from the anchor & Ctrl only moves focus
    const moveTo = (
      index: number,
      { extend = false, moveOnly = false } = {}
    ): void => {
      const button = buttons[index];

      if (!button) return;

      if (extend) {
        const anchorIndex = focusedEntries.includes(anchorEntryRef.current)
          ? fileNames.indexOf(anchorEntryRef.current)
          : Math.max(currentIndex, 0);

        anchorEntryRef.current = fileNames[anchorIndex];
        blurEntry();
        fileNames
          .slice(Math.min(anchorIndex, index), Math.max(anchorIndex, index) + 1)
          .forEach((entry) => focusEntry(entry));
      } else if (!moveOnly) {
        anchorEntryRef.current = fileNames[index];

        // Selecting it again would redraw every entry for nothing
        if (
          focusedEntries.length !== 1 ||
          focusedEntries[0] !== fileNames[index]
        ) {
          blurEntry();
          focusEntry(fileNames[index]);
        }
      }

      button.focus(PREVENT_SCROLL);
      scrollIntoList(button);
    };
    const navigate = (
      options: { extend?: boolean; moveOnly?: boolean } = {}
    ): boolean => {
      if (buttons.length === 0) return false;

      if (key === "Home" || key === "End") {
        moveTo(key === "Home" ? 0 : buttons.length - 1, options);
      } else if (key.startsWith("Arrow") || key.startsWith("Page")) {
        moveTo(
          currentIndex === -1
            ? 0
            : getNeighborIndex(
                key,
                currentIndex,
                buttons,
                key.startsWith("Page")
                  ? fileManagerRef.current?.clientHeight || 1
                  : 0,
                isDesktop
              ),
          options
        );
      } else return false;

      haltEvent(event);

      return true;
    };
    const onDelete = (): void => {
      if (focusedEntries.length > 0) {
        haltEvent(event);

        if (url === DESKTOP_PATH) {
          saveUnpositionedDesktopIcons(setIconPositions);
        }

        focusedEntries.forEach(async (entry) => {
          const path = join(url, entry);

          if (await deletePath(path)) updateFiles(undefined, path);
        });
        blurEntry();

        // Like Explorer, the entry taking the place of what was deleted is
        // selected next
        const isKept = (entry: string): boolean =>
          !focusedEntries.includes(entry);
        const fromIndex = Math.max(currentIndex, 0);
        const nextEntry =
          fileNames.slice(fromIndex).find(isKept) ||
          fileNames.slice(0, fromIndex).reverse().find(isKept);

        if (nextEntry) focusEntry(nextEntry);
      }
    };

    if (shiftKey) {
      const newView = ctrlKey && !isDesktop ? VIEW_KEYS[event.code] : undefined;

      if (newView) {
        setView?.(newView);
        requestAnimationFrame(() =>
          (
            fileManagerRef.current?.querySelector<HTMLElement>(
              ":scope > li.focus-within > button"
            ) || fileManagerRef.current
          )?.focus(PREVENT_SCROLL)
        );
      } else if (key === "Delete") onDelete();
      else if (!altKey) navigate({ extend: true });

      // Shifted characters still jump to names
      if (!isPrintableKey(event)) return;
    }

    if (ctrlKey) {
      const lKey = key.toLowerCase();

      if (navigate({ moveOnly: true })) return;

      // eslint-disable-next-line default-case
      switch (lKey) {
        case " ":
          if (currentIndex !== -1) {
            const entry = fileNames[currentIndex];

            haltEvent(event);
            anchorEntryRef.current = entry;
            if (focusedEntries.includes(entry)) {
              blurEntry(entry);
              // A single remaining selection would otherwise take focus
              if (focusedEntries.length === 2) {
                requestAnimationFrame(() =>
                  buttons[currentIndex]?.focus(PREVENT_SCROLL)
                );
              }
            } else focusEntry(entry);
          }
          break;
        case "a":
          haltEvent(event);
          if (target instanceof HTMLOListElement) {
            buttons[0]?.focus(PREVENT_SCROLL);
          }
          fileNames.forEach(focusEntry);
          break;
        case "c":
          haltEvent(event);
          copyEntries(focusedEntries.map((entry) => join(url, entry)));
          break;
        case "d":
          onDelete();
          break;
        case "r":
          haltEvent(event);
          updateFiles();
          break;
        case "x":
          haltEvent(event);
          moveEntries(focusedEntries.map((entry) => join(url, entry)));
          break;
        case "v":
          event.stopPropagation();
          if (
            !(target instanceof HTMLInputElement) &&
            !(target instanceof HTMLTextAreaElement)
          ) {
            pasteToFolder();
          }
          break;
      }
    } else if (altKey) {
      const lKey = key.toLowerCase();

      if (lKey === "n") {
        haltEvent(event);
        open("FileExplorer", { url });
      } else if (key === "Enter" && focusedEntries.length > 0) {
        haltEvent(event);
        open("Properties", { url: join(url, focusedEntries[0]) });
      }
    } else {
      switch (key) {
        case "F2":
          if (focusedEntries.length > 0) {
            const focusedEntry = fileNames[currentIndex];

            haltEvent(event);
            setRenaming(
              focusedEntries.includes(focusedEntry)
                ? focusedEntry
                : focusedEntries[focusedEntries.length - 1]
            );
          }
          break;
        case "F5":
          if (id) {
            haltEvent(event);
            updateFiles();
          }
          break;
        case "Delete":
          onDelete();
          break;
        case "Backspace":
          if (id) {
            haltEvent(event);
            changeUrl(id, dirname(url));
          }
          break;
        case "Enter":
          if (
            target instanceof HTMLButtonElement &&
            fileManagerRef.current?.contains(target)
          ) {
            haltEvent(event);
            sendMouseClick(target, 2);
          } else if (
            target instanceof HTMLOListElement &&
            target === fileManagerRef.current &&
            focusedEntries.length > 0
          ) {
            // WebKit leaves the list focused after clicking an entry
            haltEvent(event);
            clickEntryButton(fileManagerRef, focusedEntries[0]);
          }
          break;
        default: {
          if (navigate() || key.length !== 1 || metaKey) break;

          const now = Date.now();
          const typeAhead = typeAheadRef.current;

          // Moving elsewhere, as by a click, starts over too
          if (
            now - typeAhead.time > TYPE_AHEAD_RESET_MS ||
            currentIndex !== typeAhead.index
          ) {
            typeAhead.text = "";
          }
          typeAhead.time = now;

          if (key === " " && !typeAhead.text) {
            if (currentIndex !== -1) {
              haltEvent(event);
              moveTo(currentIndex);
            }
            break;
          }

          haltEvent(event);
          typeAhead.text += key.toLowerCase();

          // Repeating a letter cycles through its entries, otherwise names
          // are matched by everything typed so far
          const isRepeat = [...typeAhead.text].every(
            (character) => character === typeAhead.text[0]
          );
          const searchText = isRepeat ? typeAhead.text[0] : typeAhead.text;
          const startIndex =
            currentIndex === -1 ? 0 : currentIndex + (isRepeat ? 1 : 0);
          const matchIndex = fileNames
            .map((_, index) => (startIndex + index) % fileNames.length)
            .find((index) =>
              fileNames[index].toLowerCase().startsWith(searchText)
            );

          if (matchIndex !== undefined) {
            typeAhead.index = matchIndex;
            moveTo(matchIndex);
          }
        }
      }
    }
  };
};

export default useFileKeyboardShortcuts;
