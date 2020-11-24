import styles from '@/styles/System/Desktop/Desktop.module.scss';

import useWallpaper from '@/hooks/useWallpaper';
import { useRef } from 'react';

const Desktop: React.FC = ({ children }) => {
  const desktopRef = useRef<HTMLElement>(null);

  useWallpaper(desktopRef);

  return (
    <main className={styles.desktop} ref={desktopRef}>
      {children}
    </main>
  );
};

export default Desktop;
