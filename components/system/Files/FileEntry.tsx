import { useProcesses } from 'contexts/process';
import useFileInfo from 'hooks/useFileInfo';
import { useCallback } from 'react';
import StyledFileEntry from 'styles/components/system/Files/StyledFileEntry';

type FileEntryProps = {
  name: string;
  path: string;
};

const FileEntry = ({ name, path }: FileEntryProps): JSX.Element => {
  const { icon, pid } = useFileInfo(path);
  const { open } = useProcesses();
  const onActivate = useCallback(() => open(pid), [open, pid]);

  return (
    <StyledFileEntry>
      <button type="button" onClick={onActivate} onKeyDown={onActivate}>
        <figure>
          <img src={icon} alt={name} />
          <figcaption>{name}</figcaption>
        </figure>
      </button>
    </StyledFileEntry>
  );
};

export default FileEntry;
