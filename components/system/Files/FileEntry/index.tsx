import useContextMenu from 'components/system/Files/FileEntry/useContextMenu';
import useFile from 'components/system/Files/FileEntry/useFile';
import useFileInfo from 'components/system/Files/FileEntry/useFileInfo';
import useDoubleClick from 'components/system/useDoubleClick';
import { useMenu } from 'contexts/menu';
import { useCallback } from 'react';
import Button from 'styles/common/Button';
import Icon from 'styles/common/Icon';

type FileEntryProps = {
  deleteFile: (path: string) => void;
  name: string;
  path: string;
};

const FileEntry = ({ deleteFile, name, path }: FileEntryProps): JSX.Element => {
  const { icon, pid, url } = useFileInfo(path);
  const { contextMenu } = useMenu();
  const openFile = useFile(url, pid);
  const deleteEntry = useCallback(() => deleteFile(path), [deleteFile, path]);
  const menu = useContextMenu(url, pid, deleteEntry);

  return (
    <Button
      onClick={useDoubleClick(openFile)}
      onContextMenu={contextMenu(menu)}
    >
      <figure>
        <Icon src={icon} alt={name} size={48} />
        <figcaption>{name}</figcaption>
      </figure>
    </Button>
  );
};

export default FileEntry;
