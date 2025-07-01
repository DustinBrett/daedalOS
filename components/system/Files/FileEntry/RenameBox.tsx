import { extname } from "path";
import { useTheme } from "styled-components";
import { memo, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { type FileManagerViewNames } from "components/system/Files/Views";
import { measureText } from "components/system/Files/FileEntry/functions";
import StyledRenameBox from "components/system/Files/FileEntry/StyledRenameBox";
import { PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";

type RenameBoxProps = {
  isDesktop?: boolean;
  name: string;
  path: string;
  renameFile: (path: string, name?: string) => void;
  setRenaming: React.Dispatch<React.SetStateAction<string>>;
  view: FileManagerViewNames;
};

const TEXT_HEIGHT_PADDING = 2;
const TEXT_WIDTH_PADDING = 22;

const RenameBox: FC<RenameBoxProps> = ({
  isDesktop,
  name,
  path,
  renameFile,
  setRenaming,
  view,
}) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const saveRename = (): void => renameFile(path, inputRef.current?.value);
  const { formats, sizes } = useTheme();
  const isDetails = useMemo(() => view === "details", [view]);
  const updateDimensions = useCallback(
    (textArea: EventTarget | HTMLTextAreaElement | null): void => {
      if (textArea instanceof HTMLTextAreaElement) {
        const width = measureText(
          textArea.value,
          sizes.fileEntry.fontSize,
          formats.systemFont
        );

        // Force height to re-calculate
        if (!isDetails) textArea.setAttribute("style", "height: 1px");

        const newWidth = `width: ${width + TEXT_WIDTH_PADDING}px`;
        const newHeight = `height: ${textArea.scrollHeight + TEXT_HEIGHT_PADDING}px`;

        textArea.setAttribute(
          "style",
          isDetails ? newWidth : `${newHeight}; ${newWidth}`
        );
      }
    },
    [formats.systemFont, isDetails, sizes.fileEntry.fontSize]
  );

  useLayoutEffect(() => {
    requestAnimationFrame(() => updateDimensions(inputRef.current));
  }, [updateDimensions]);

  useLayoutEffect(() => {
    updateDimensions(inputRef.current);
    inputRef.current?.focus(PREVENT_SCROLL);
    inputRef.current?.setSelectionRange(0, name.length - extname(name).length);
  }, [name, updateDimensions]);

  return (
    <StyledRenameBox
      ref={inputRef}
      $darkMode={!isDesktop}
      $singleLineMode={isDetails}
      defaultValue={name}
      onBlurCapture={saveRename}
      onClick={haltEvent}
      onDragStart={haltEvent}
      onKeyDown={({ key }) => {
        if (key === "Enter") saveRename();
        else if (key === "Escape") setRenaming("");
      }}
      onKeyUp={(event) => {
        updateDimensions(event.target);
        haltEvent(event);
      }}
    />
  );
};

export default memo(RenameBox);
