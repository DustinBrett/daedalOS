import styles from '../styles/Desktop.module.scss';

export default function Desktop({ children }: any) { // TODO: What type has `children`?
  return (
    <div className={ styles.desktop }>
      { children }
    </div>
  );
};
