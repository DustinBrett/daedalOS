import { useState } from "react";

type FocusedEntryProps = {
  className: string;
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
  const blurEntry = (entry?: string): void =>
    setFocusedEntries(
      entry
        ? (currentFocusedEntries) =>
            currentFocusedEntries.filter(
              (focusedEntry) => focusedEntry !== entry
            )
        : []
    );
  const focusEntry = (entry: string): void =>
    setFocusedEntries((currentFocusedEntries) => [
      ...currentFocusedEntries,
      entry,
    ]);
  const onBlurCapture: React.FocusEventHandler = ({ relatedTarget }) => {
    if (
      !(relatedTarget instanceof HTMLElement) ||
      !fileManagerRef.current?.contains(relatedTarget)
    ) {
      blurEntry();
    }
  };
  const focusableEntry = (file: string): FocusedEntryProps => {
    const isFocused = focusedEntries.includes(file);
    const className = isFocused ? "focus-within" : "";
    const onClick: React.MouseEventHandler = ({ ctrlKey }) => {
      if (ctrlKey) {
        if (isFocused) {
          blurEntry(file);
        } else {
          focusEntry(file);
        }
      } else {
        blurEntry();
        focusEntry(file);
      }
    };

    return { className, onBlurCapture, onClick };
  };

  return { blurEntry, focusableEntry, focusedEntries, focusEntry };
};

export default useFocusableEntries;
