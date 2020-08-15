import styles from '../styles/TaskbarEntry.module.scss';
import { useContext } from 'react';
import { AppsContext } from '../resources/AppsProvider';

type TaskbarEntryType = {
  icon: JSX.Element,
  id: string,
  name: string
};

export default function TaskbarEntry({ icon, id, name }: TaskbarEntryType) {
  const { updateApp = () => {} } = useContext(AppsContext),
    openApp = () => updateApp({ id, minimized: false });

  return (
    <div className={ styles.taskbar_entry } onClick={ openApp }>
      { icon }
      { name }
    </div>
  );
};
