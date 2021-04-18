import FileEntry from 'components/system/Files/FileEntry';
import StyledFileEntry from 'components/system/Files/FileEntry/StyledFileEntry';
import StyledFileManager from 'components/system/Files/FileManager/StyledFileManager';
import useFileDrop from 'components/system/Files/FileManager/useFileDrop';
import useFiles from 'components/system/Files/FileManager/useFiles';
import { basename, extname, resolve } from 'path';

type FileManagerProps = {
  directory: string;
};

const FileManager = ({ directory }: FileManagerProps): JSX.Element => {
  const { files, updateFiles } = useFiles(directory);

  return (
    <StyledFileManager {...useFileDrop(directory, updateFiles)}>
      {files.map((file) => (
        <StyledFileEntry key={file}>
          <FileEntry
            name={basename(file, extname(file))}
            path={resolve(directory, file)}
          />
        </StyledFileEntry>
      ))}
    </StyledFileManager>
  );
};

export default FileManager;
