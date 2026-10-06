import { useRef, useState } from "react";
import { PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";

type FocusedEntryProps = {
  className?: string;
  onBlurCapture: React.FocusEventHandler;
  onFocusCapture: React.FocusEventHandler;
  onMouseDown: React.MouseEventHandler;
  onMouseUp: React.MouseEventHandler;
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
  fileManagerRef: React.RefObject<HTMLOListElement | null>
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
    setFocusedEntries((currentFocusedEntries) =>
      currentFocusedEntries.includes(entry)
        ? currentFocusedEntries
        : [...currentFocusedEntries, entry]
    );
  const focusingRef = useRef(false);
  const onBlurCapture: React.FocusEventHandler = (event) => {
    const { relatedTarget, target } = event;
    const isFileManagerFocus = fileManagerRef.current === relatedTarget;

    if (isFileManagerFocus && focusingRef.current) {
      haltEvent(event);
      (target as HTMLElement)?.focus(PREVENT_SCROLL);
    } else if (
      (!isFileManagerFocus &&
        !fileManagerRef.current?.contains(relatedTarget)) ||
      !(relatedTarget instanceof HTMLElement)
    ) {
      blurEntry();
    }
  };
  const onFocusCapture: React.FocusEventHandler = () => {
    focusingRef.current = true;
    window.requestAnimationFrame(() => {
      focusingRef.current = false;
    });
  };
  const mouseDownPositionRef = useRef({ x: 0, y: 0 });
  const focusableEntry = (file: string): FocusedEntryProps => {
    const isFocused = focusedEntries.includes(file);
    const className = isFocused ? "focus-within" : undefined;
    const onMouseDown: React.MouseEventHandler = ({
      ctrlKey,
      pageX,
      pageY,
    }) => {
      mouseDownPositionRef.current = { x: pageX, y: pageY };

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
    const onMouseUp: React.MouseEventHandler = ({
      button,
      ctrlKey,
      pageX,
      pageY,
    }) => {
      const { x, y } = mouseDownPositionRef.current;

      if (
        !ctrlKey &&
        button === 0 &&
        x === pageX &&
        y === pageY &&
        focusedEntries.length !== 1 &&
        focusedEntries[0] !== file
      ) {
        blurEntry();
        focusEntry(file);
      }

      mouseDownPositionRef.current = { x: 0, y: 0 };
    };
    return {
      className,
      onBlurCapture,
      onFocusCapture,
      onMouseDown,
      onMouseUp,
    };
  };

  return { blurEntry, focusableEntry, focusedEntries, focusEntry };
};

export default useFocusableEntries;
