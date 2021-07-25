import FileEntry from "components/system/Files/FileEntry";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useFolder from "components/system/Files/FileManager/useFolder";
import useFolderContextMenu from "components/system/Files/FileManager/useFolderContextMenu";
import type { FileManagerViewNames } from "components/system/Files/Views";
import { FileManagerViews } from "components/system/Files/Views";
import { useFileSystem } from "contexts/fileSystem";
import { basename, extname, join } from "path";
import { useEffect } from "react";
import { MOUNTABLE_EXTENSIONS, SHORTCUT_EXTENSION } from "utils/constants";

type FileManagerProps = {
  url: string;
  view: FileManagerViewNames;
};

const FileManager = ({ url, view }: FileManagerProps): JSX.Element => {
  const { fileActions, files, folderActions, updateFiles } = useFolder(url);
  const { mountFs, unMountFs } = useFileSystem();
  const { StyledFileEntry, StyledFileManager } = FileManagerViews[view];

  useEffect(() => {
    const isMountable = MOUNTABLE_EXTENSIONS.has(extname(url));

    if (isMountable && files.length === 0) mountFs(url, updateFiles);

    return () => {
      if (isMountable && files.length > 0) unMountFs(url);
    };
  }, [files, mountFs, unMountFs, updateFiles, url]);

  return (
    <StyledFileManager
      {...useFileDrop(folderActions.newPath)}
      {...useFolderContextMenu(folderActions, updateFiles)}
    >
      {files.map((file) => (
        <StyledFileEntry key={file}>
          <FileEntry
            fileActions={fileActions}
            name={basename(file, SHORTCUT_EXTENSION)}
            path={join(url, file)}
            view={view}
          />
        </StyledFileEntry>
      ))}
    </StyledFileManager>
  );
};

export default FileManager;
