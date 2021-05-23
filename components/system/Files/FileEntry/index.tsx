import RenameBox from 'components/system/Files/FileEntry/RenameBox';
import useContextMenu from 'components/system/Files/FileEntry/useContextMenu';
import useFile from 'components/system/Files/FileEntry/useFile';
import useFileInfo from 'components/system/Files/FileEntry/useFileInfo';
import useDoubleClick from 'components/system/useDoubleClick';
import { useMenu } from 'contexts/menu';
import { useCallback, useState } from 'react';
import Button from 'styles/common/Button';
import Icon from 'styles/common/Icon';

type FileEntryProps = {
  deleteFile: (path: string) => void;
  name: string;
  path: string;
  renameFile: (path: string, name?: string) => void;
};

const FileEntry = ({
  deleteFile,
  name,
  path,
  renameFile
}: FileEntryProps): JSX.Element => {
  const { icon, pid, url } = useFileInfo(path);
  const [renaming, setRenaming] = useState(false);
  const { contextMenu } = useMenu();
  const openFile = useFile(url, pid);
  const deleteEntry = useCallback(() => deleteFile(path), [deleteFile, path]);
  const renameEntry = useCallback(() => setRenaming(true), [setRenaming]);
  const menu = useContextMenu(url, pid, deleteEntry, renameEntry);

  return (
    <Button
      onClick={useDoubleClick(openFile)}
      onContextMenu={contextMenu(menu)}
    >
      <figure>
        <Icon src={icon} alt={name} size={48} />
        {renaming ? (
          <RenameBox
            name={name}
            path={path}
            renameFile={(origPath, newName) => {
              renameFile(origPath, newName);
              setRenaming(false);
            }}
          />
        ) : (
          <figcaption>{name}</figcaption>
        )}
      </figure>
    </Button>
  );
};

export default FileEntry;
