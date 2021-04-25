import useFileInfo from 'components/system/Files/FileEntry/useFileInfo';
import useDoubleClick from 'components/system/useDoubleClick';
import { useProcesses } from 'contexts/process';
import { createPid } from 'contexts/process/functions';
import { useSession } from 'contexts/session';
import { useCallback } from 'react';
import Button from 'styles/common/Button';
import Icon from 'styles/common/Icon';

type FileEntryProps = {
  name: string;
  path: string;
};

const FileEntry = ({ name, path }: FileEntryProps): JSX.Element => {
  const { icon, pid, url } = useFileInfo(path);
  const { setForegroundId } = useSession();
  const { minimize, open, processes } = useProcesses();
  const onClick = useCallback(() => {
    const id = createPid(pid, url);

    if (processes[id]) {
      if (processes[id].minimized) minimize(id);
      setForegroundId(id);
    } else {
      open(pid, url);
    }
  }, [minimize, open, pid, processes, setForegroundId, url]);

  return (
    <Button onClick={useDoubleClick(onClick)}>
      <figure>
        <Icon src={icon} alt={name} size={48} />
        <figcaption>{name}</figcaption>
      </figure>
    </Button>
  );
};

export default FileEntry;
