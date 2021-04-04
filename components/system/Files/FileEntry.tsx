import { useProcesses } from 'contexts/process';
import useDoubleClick from 'hooks/useDoubleClick';
import useFileInfo from 'hooks/useFileInfo';
import { useCallback } from 'react';
import Button from 'styles/common/Button';
import Image from 'styles/common/Image';
import StyledFileEntry from 'styles/components/system/Files/StyledFileEntry';

type FileEntryProps = {
  name: string;
  path: string;
};

const FileEntry = ({ name, path }: FileEntryProps): JSX.Element => {
  const { icon, pid, url } = useFileInfo(path);
  const { open } = useProcesses();
  const onClick = useCallback(() => open(pid, url), [open, pid, url]);

  return (
    <StyledFileEntry>
      <Button onClick={useDoubleClick(onClick)}>
        <figure>
          <Image src={icon} alt={name} />
          <figcaption>{name}</figcaption>
        </figure>
      </Button>
    </StyledFileEntry>
  );
};

export default FileEntry;
