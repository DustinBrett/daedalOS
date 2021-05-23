import StyledRenameBox from 'components/system/Files/FileEntry/StyledRenameBox';
import { useCallback, useEffect, useRef } from 'react';

type RenameBoxProps = {
  name: string;
  path: string;
  renameFile: (path: string, name?: string) => void;
};

const RenameBox = ({ name, path, renameFile }: RenameBoxProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const saveRename = useCallback(
    () => renameFile(path, inputRef?.current?.value),
    [path, renameFile]
  );

  useEffect(() => {
    inputRef?.current?.focus();
    inputRef?.current?.select();
  }, []);

  return (
    <StyledRenameBox
      defaultValue={name}
      onBlur={saveRename}
      onKeyDown={({ key }) => key === 'Enter' && saveRename()}
      ref={inputRef}
    />
  );
};

export default RenameBox;
