import { useCallback, useState } from "react";
import { clsx } from "utils/functions";

type FocusedEntryProps = {
  className?: string;
  onBlurCapture: React.FocusEventHandler;
  onClick: React.MouseEventHandler;
};

type FocusableEntry = (file: string) => FocusedEntryProps;

export type FocusEntryFunctions = {
  blurEntry: (entry?: string) => void;
  focusEntry: (entry: string) => void;
};

type FocusableEntries = FocusEntryFunctions & {
  focusableEntry: FocusableEntry;
  focusedEntries: string[];
};

const useFocusableEntries = (
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>
): FocusableEntries => {
  const [focusedEntries, setFocusedEntries] = useState<string[]>([]);
  const blurEntry = useCallback(
    (entry?: string): void =>
      setFocusedEntries(
        entry
          ? (currentFocusedEntries) =>
              currentFocusedEntries.filter(
                (focusedEntry) => focusedEntry !== entry
              )
          : []
      ),
    []
  );
  const focusEntry = useCallback(
    (entry: string): void =>
      setFocusedEntries((currentFocusedEntries) =>
        currentFocusedEntries.includes(entry)
          ? currentFocusedEntries
          : [...currentFocusedEntries, entry]
      ),
    []
  );
  const onBlurCapture: React.FocusEventHandler = ({ relatedTarget }) => {
    if (
      !(relatedTarget instanceof HTMLElement) ||
      fileManagerRef.current === relatedTarget ||
      !fileManagerRef.current?.contains(relatedTarget)
    ) {
      blurEntry();
    }
  };
  const focusableEntry = (file: string): FocusedEntryProps => {
    const isFocused = focusedEntries.includes(file);
    const isOnlyFocusedEntry =
      focusedEntries.length === 1 && focusedEntries[0] === file;
    const className = clsx({
      "focus-within": isFocused,
      "only-focused": isOnlyFocusedEntry,
    });
    const onClick: React.MouseEventHandler = ({ ctrlKey }) => {
      if (ctrlKey) {
        if (isFocused) {
          blurEntry(file);
        } else {
          focusEntry(file);
        }
      } else if (!isFocused) {
        blurEntry();
        focusEntry(file);
      }
    };

    return { className, onBlurCapture, onClick };
  };

  return { blurEntry, focusEntry, focusableEntry, focusedEntries };
};

export default useFocusableEntries;
