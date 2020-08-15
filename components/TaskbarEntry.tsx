import styles from '../styles/TaskbarEntry.module.scss';
import { useContext } from 'react';
import { AppsContext } from '../resources/AppsProvider';

type TaskbarEntryType = {
  icon: JSX.Element,
  id: string,
  name: string
};

export default function TaskbarEntry({ icon, id, name }: TaskbarEntryType) {
  const { apps = {}, updateApp = () => {} } = useContext(AppsContext),
    toggleAppMinimized = () => updateApp({ id, minimized: !apps[id].minimized });

  return (
    <div className={ styles.taskbar_entry } onClick={ toggleAppMinimized }>
      { icon }
      { name }
    </div>
  );
};
