import StyledRenameBox from "components/system/Files/FileEntry/StyledRenameBox";
import { getTextWrapData } from "components/system/Files/FileEntry/functions";
import { extname } from "path";
import { useCallback, useLayoutEffect, useRef } from "react";
import { useTheme } from "styled-components";
import { PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";

type RenameBoxProps = {
  name: string;
  path: string;
  renameFile: (path: string, name?: string) => void;
};

const TEXT_HEIGHT_PADDING = 2;
const TEXT_WIDTH_PADDING = 22;

const RenameBox: FC<RenameBoxProps> = ({ name, path, renameFile }) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const saveRename = (): void => renameFile(path, inputRef.current?.value);
  const { formats, sizes } = useTheme();
  const updateDimensions = useCallback(
    (textArea: EventTarget | HTMLTextAreaElement | null): void => {
      if (textArea instanceof HTMLTextAreaElement) {
        const { width } = getTextWrapData(
          textArea.value,
          sizes.fileEntry.fontSize,
          formats.systemFont
        );

        // Force height to re-calculate
        textArea.setAttribute("style", "height: 1px");
        textArea.setAttribute(
          "style",
          `height: ${textArea.scrollHeight + TEXT_HEIGHT_PADDING}px; width: ${
            width + TEXT_WIDTH_PADDING
          }px`
        );
      }
    },
    [formats.systemFont, sizes.fileEntry.fontSize]
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
      defaultValue={name}
      onBlurCapture={saveRename}
      onClick={haltEvent}
      onDragStart={haltEvent}
      onKeyDown={({ key }) => {
        if (key === "Enter") saveRename();
      }}
      onKeyUp={(event) => {
        updateDimensions(event.target);
        haltEvent(event);
      }}
    />
  );
};

export default RenameBox;
