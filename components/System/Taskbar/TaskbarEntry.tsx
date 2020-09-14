import styles from '@/styles/System/Taskbar/TaskbarEntry.module.scss';

import type { FC } from 'react';

import { useContext } from 'react';
import { SessionContext } from '@/contexts/SessionManager';

type TaskbarEntryType = {
  icon: string;
  id: string;
  name: string;
  onBlur: () => void;
  onClick: () => void;
};

export const TaskbarEntry: FC<TaskbarEntryType> = ({
  icon,
  id,
  name,
  onBlur,
  onClick
}) => {
  const { session } = useContext(SessionContext);

  return (
    <div
      className={`${styles.taskbarEntry} ${
        session.foreground === id && styles.foreground
      }`}
      onClick={onClick}
      onBlur={onBlur}
      tabIndex={0}
    >
      <figure>
        <img alt={name} src={icon} draggable={false} />
        <figcaption>{name}</figcaption>
      </figure>
    </div>
  );
};

export default TaskbarEntry;
