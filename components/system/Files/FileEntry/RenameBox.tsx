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
  const saveRename = (): void => renameFile(path, inputRef?.current?.value);

  useEffect(() => {
    inputRef?.current?.focus(PREVENT_SCROLL);
    inputRef?.current?.setSelectionRange(0, name.length - extname(name).length);
  }, [name]);

  return (
    <StyledRenameBox
      defaultValue={name}
      onBlurCapture={saveRename}
      onClick={haltEvent}
      onKeyDown={({ key }) => key === "Enter" && saveRename()}
      onKeyUp={haltEvent}
      ref={inputRef}
    />
  );
};

export default RenameBox;
