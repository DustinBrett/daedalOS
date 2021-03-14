import { useProcesses } from 'contexts/process';
import { useCallback } from 'react';
import Button from 'styles/common/Button';
import StyledTaskbarEntry from 'styles/components/system/Taskbar/StyledTaskbarEntry';

type TaskbarEntryProps = {
  icon: string;
  id: string;
  title: string;
};

const TaskbarEntry = ({ icon, id, title }: TaskbarEntryProps): JSX.Element => {
  const { minimize } = useProcesses();
  const onClick = useCallback(() => minimize(id), [id, minimize]);

  return (
    <StyledTaskbarEntry>
      <Button onClick={onClick}>
        <figure>
          <img src={icon} alt={title} />
          <figcaption>{title}</figcaption>
        </figure>
      </Button>
    </StyledTaskbarEntry>
  );
};

export default TaskbarEntry;
