import FileEntry from 'components/system/Files/FileEntry';
import StyledFileEntry from 'components/system/Files/FileEntry/StyledFileEntry';
import StyledFileManager from 'components/system/Files/FileManager/StyledFileManager';
import useFileDrop from 'components/system/Files/FileManager/useFileDrop';
import useFiles from 'components/system/Files/FileManager/useFiles';
import { useFileSystem } from 'contexts/fileSystem';
import { basename, extname, resolve } from 'path';
import { useEffect } from 'react';

type FileManagerProps = {
  url: string;
};

const MOUNTABLE_EXTENSIONS = ['.iso', '.zip'];

const FileManager = ({ url }: FileManagerProps): JSX.Element => {
  const { deleteFile, files, renameFile, updateFiles } = useFiles(url);
  const { mountFs, unMountFs } = useFileSystem();

  useEffect(() => {
    const isMountable = MOUNTABLE_EXTENSIONS.includes(extname(url));

    if (isMountable && !files.length) mountFs(url, updateFiles);

    return () => {
      if (isMountable && files.length) unMountFs(url);
    };
  }, [files, mountFs, unMountFs, updateFiles, url]);

  return (
    <StyledFileManager {...useFileDrop(url, updateFiles)}>
      {files.map((file) => (
        <StyledFileEntry key={file}>
          <FileEntry
            deleteFile={deleteFile}
            name={basename(file, extname(file))}
            path={resolve(url, file)}
            renameFile={renameFile}
          />
        </StyledFileEntry>
      ))}
    </StyledFileManager>
  );
};

export default FileManager;
