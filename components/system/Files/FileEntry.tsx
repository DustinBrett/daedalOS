import StyledFileEntry from 'components/system/Files/StyledFileEntry';
import useDoubleClick from 'components/system/Files/useDoubleClick';
import useFileInfo from 'components/system/Files/useFileInfo';
import { useProcesses } from 'contexts/process';
import { useCallback } from 'react';
import Button from 'styles/common/Button';
import Image from 'styles/common/Image';

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
