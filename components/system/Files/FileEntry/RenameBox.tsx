import { getTextWrapData } from "components/system/Files/FileEntry/functions";
import StyledRenameBox from "components/system/Files/FileEntry/StyledRenameBox";
import { extname } from "path";
import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import { PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";

type RenameBoxProps = {
  name: string;
  path: string;
  renameFile: (path: string, name?: string) => void;
};

const RenameBox = ({ name, path, renameFile }: RenameBoxProps): JSX.Element => {
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

        /* eslint-disable no-param-reassign */
        textArea.style.height = "1px";
        textArea.style.height = `${textArea.scrollHeight + 2}px`;
        textArea.style.width = `${width + 22}px`;
        /* eslint-enable no-param-reassign */
      }
    },
    [formats.systemFont, sizes.fileEntry.fontSize]
  );

  useEffect(() => {
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
