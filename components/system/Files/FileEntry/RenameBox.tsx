import { getTextWrapData } from "components/system/Files/FileEntry/functions";
import { haltEvent } from "components/system/Files/FileManager/functions";
import StyledRenameBox from "components/system/Files/Views/StyledRenameBox";
import { extname } from "path";
import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import { PREVENT_SCROLL } from "utils/constants";

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
    (text: string): void => {
      const textPadding = sizes.fileEntry.renamePadding * 2 + 2;
      const { lines, width } = getTextWrapData(
        text,
        sizes.fileEntry.fontSize,
        formats.systemFont,
        sizes.fileEntry.renameWidth - textPadding
      );

      inputRef.current?.setAttribute("rows", lines.length.toString());
      inputRef.current?.setAttribute(
        "style",
        `width: ${Math.ceil(width + textPadding)}px`
      );
    },
    [
      formats.systemFont,
      sizes.fileEntry.fontSize,
      sizes.fileEntry.renamePadding,
      sizes.fileEntry.renameWidth,
    ]
  );

  useEffect(() => {
    inputRef.current?.focus(PREVENT_SCROLL);
    inputRef.current?.setSelectionRange(0, name.length - extname(name).length);
    updateDimensions(name);
  }, [name, updateDimensions]);

  return (
    <StyledRenameBox
      defaultValue={name}
      onBlurCapture={saveRename}
      onClick={haltEvent}
      onKeyDown={({ key, target }) => {
        if (key === "Enter") {
          saveRename();
        } else if (key.length === 1 && target instanceof HTMLTextAreaElement) {
          updateDimensions(`${target.value}${key}`);
        }
      }}
      onKeyUp={(event) => {
        if (event.target instanceof HTMLTextAreaElement) {
          updateDimensions(event.target.value);
        }

        haltEvent(event);
      }}
      ref={inputRef}
    />
  );
};

export default RenameBox;
