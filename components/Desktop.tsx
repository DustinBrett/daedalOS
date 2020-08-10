import styles from '../styles/Desktop.module.scss';

export default function Desktop({ children }) {
  return (
    <div className={ styles.desktop }>
      { children }
    </div>
  );
};
