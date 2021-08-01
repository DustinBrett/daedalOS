import RenameBox from "components/system/Files/FileEntry/RenameBox";
import useFile from "components/system/Files/FileEntry/useFile";
import useFileContextMenu from "components/system/Files/FileEntry/useFileContextMenu";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import type { FileActions } from "components/system/Files/FileManager/useFolder";
import { FileEntryIconSize } from "components/system/Files/Views";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { doubleClick } from "utils/functions";

type FileEntryProps = {
  fileActions: FileActions;
  name: string;
  path: string;
  renaming: boolean;
  setRenaming: React.Dispatch<React.SetStateAction<string>>;
  view: string;
};

const FileEntry = ({
  fileActions,
  name,
  path,
  renaming,
  setRenaming,
  view,
}: FileEntryProps): JSX.Element => {
  const { icon, pid, url } = useFileInfo(path);
  const openFile = useFile(url);
  const singleClick = view === "list";

  return (
    <Button
      onClick={doubleClick(() => openFile(pid), singleClick)}
      {...useFileContextMenu(url, pid, path, setRenaming, fileActions)}
    >
      <figure>
        <Icon src={icon} alt={name} {...FileEntryIconSize[view]} />
        {renaming ? (
          <RenameBox
            name={name}
            path={path}
            renameFile={(origPath, newName) => {
              fileActions.renameFile(origPath, newName);
              setRenaming("");
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
