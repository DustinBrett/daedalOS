import styles from '../styles/TaskbarEntry.module.scss';

type TaskbarEntryType = {
  icon: JSX.Element,
  name: string
};

export default function TaskbarEntry({ icon, name }: TaskbarEntryType) {
  return (
    <div className={ styles.taskbar_entry }>
      { icon }
      { name }
    </div>
  );
};
