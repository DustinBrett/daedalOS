import styles from '../styles/Desktop.module.scss';

type DesktopType = {
  children: Array<JSX.Element>
}

export default function Desktop({ children }: DesktopType) {
  return (
    <div className={ styles.desktop }>
      { children }
    </div>
  );
};
