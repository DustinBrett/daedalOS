import RenameBox from "components/system/Files/FileEntry/RenameBox";
import useContextMenu from "components/system/Files/FileEntry/useContextMenu";
import useFile from "components/system/Files/FileEntry/useFile";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import type { FileActions } from "components/system/Files/FileManager/useFiles";
import { FileEntryIconSize } from "components/system/Files/Views";
import useDoubleClick from "components/system/useDoubleClick";
import { useMenu } from "contexts/menu";
import { useState } from "react";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";

type FileEntryProps = {
  fileActions: FileActions;
  name: string;
  path: string;
  view: string;
};

const FileEntry = ({
  fileActions,
  name,
  path,
  view,
}: FileEntryProps): JSX.Element => {
  const { icon, pid, url } = useFileInfo(path);
  const [renaming, setRenaming] = useState(false);
  const { contextMenu } = useMenu();
  const openFile = useFile(url);
  const menu = useContextMenu(url, pid, path, setRenaming, fileActions);
  const singleClick = view === "list";

  return (
    <Button
      onClick={useDoubleClick(() => openFile(pid), singleClick)}
      onContextMenu={contextMenu(menu)}
    >
      <figure>
        <Icon src={icon} alt={name} {...FileEntryIconSize[view]} />
        {renaming ? (
          <RenameBox
            name={name}
            path={path}
            renameFile={(origPath, newName) => {
              fileActions.renameFile(origPath, newName);
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
