import { haltEvent } from "components/system/Files/FileManager/functions";
import StyledRenameBox from "components/system/Files/Views/StyledRenameBox";
import { extname } from "path";
import { useEffect, useRef } from "react";
import { PREVENT_SCROLL } from "utils/constants";

type RenameBoxProps = {
  name: string;
  path: string;
  renameFile: (path: string, name?: string) => void;
};

const RenameBox = ({ name, path, renameFile }: RenameBoxProps): JSX.Element => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const saveRename = (): void => renameFile(path, inputRef.current?.value);
  const updateDimensions = (
    textArea: EventTarget | HTMLTextAreaElement | null
  ): void => {
    if (textArea instanceof HTMLTextAreaElement) {
      textArea.setAttribute("style", "height: 1px;");
      textArea.setAttribute("style", `height: ${textArea.scrollHeight + 2}px;`);
    }
  };

  useEffect(() => {
    updateDimensions(inputRef.current);
    inputRef.current?.focus(PREVENT_SCROLL);
    inputRef.current?.setSelectionRange(0, name.length - extname(name).length);
  }, [name]);

  return (
    <StyledRenameBox
      defaultValue={name}
      onBlurCapture={saveRename}
      onClick={haltEvent}
      onKeyDown={({ key }) => {
        if (key === "Enter") saveRename();
      }}
      onKeyUp={(event) => {
        updateDimensions(event.target);
        haltEvent(event);
      }}
      ref={inputRef}
    />
  );
};

export default RenameBox;
