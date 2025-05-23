import { useCallback, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { getTextWrapData } from "components/system/Files/FileEntry/functions";
import { PREVENT_SCROLL, SHORTCUT_EXTENSION } from "utils/constants";
import { haltEvent } from "utils/functions";

type FocusedEntryProps = {
  $labelHeightOffset: number;
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
  fileManagerRef: React.RefObject<HTMLOListElement | null>,
  adjustLabelMargin: boolean
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
  const focusingRef = useRef(false);
  const onBlurCapture: React.FocusEventHandler = useCallback(
    (event) => {
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
    },
    [blurEntry, fileManagerRef]
  );
  const onFocusCapture: React.FocusEventHandler = useCallback(() => {
    focusingRef.current = true;
    window.requestAnimationFrame(() => {
      focusingRef.current = false;
    });
  }, []);
  const mouseDownPositionRef = useRef({ x: 0, y: 0 });
  const { formats, sizes } = useTheme();
  const focusableEntry = useCallback(
    (file: string): FocusedEntryProps => {
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
        ctrlKey,
        pageX,
        pageY,
        button,
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
      const textLabel = file.replace(SHORTCUT_EXTENSION, "");
      let $labelHeightOffset = 0;

      if (adjustLabelMargin) {
        const { lines } = getTextWrapData(
          textLabel,
          sizes.fileEntry.fontSize,
          formats.systemFont,
          sizes.fileEntry.maxIconTextDisplayWidth
        );

        if (lines.length > 1) {
          try {
            const element = fileManagerRef.current?.querySelector(
              `[aria-label='${CSS.escape(textLabel)}'] figcaption`
            );

            if (element) {
              $labelHeightOffset =
                (lines.length - 1) *
                Number.parseFloat(window.getComputedStyle(element).lineHeight);
            }
          } catch {
            // Ignore error getting element
          }
        }
      }

      return {
        $labelHeightOffset,
        className,
        onBlurCapture,
        onFocusCapture,
        onMouseDown,
        onMouseUp,
      };
    },
    [
      adjustLabelMargin,
      blurEntry,
      fileManagerRef,
      focusEntry,
      focusedEntries,
      formats.systemFont,
      onBlurCapture,
      onFocusCapture,
      sizes.fileEntry.fontSize,
      sizes.fileEntry.maxIconTextDisplayWidth,
    ]
  );

  return { blurEntry, focusEntry, focusableEntry, focusedEntries };
};

export default useFocusableEntries;
