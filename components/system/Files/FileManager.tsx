import FileEntry from 'components/system/Files/FileEntry';
import useFileDrop from 'hooks/useFileDrop';
import useFiles from 'hooks/useFiles';
import { basename, extname, resolve } from 'path';
import StyledFileManager from 'styles/components/system/Files/StyledFileManager';

type FileManagerProps = {
  directory: string;
};

const FileManager = ({ directory }: FileManagerProps): JSX.Element => {
  const { files, getFiles } = useFiles(directory);

  return (
    <StyledFileManager {...useFileDrop(directory, getFiles)}>
      {files.map((file) => (
        <FileEntry
          key={file}
          name={basename(file, extname(file))}
          path={resolve(directory, file)}
        />
      ))}
    </StyledFileManager>
  );
};

export default FileManager;
