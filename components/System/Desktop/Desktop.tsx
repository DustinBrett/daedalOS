import styles from '@/styles/System/Desktop/Desktop.module.scss';

import { renderWallpaperEffect } from '@/components/System/Desktop/Wallpaper';
import { useEffect, useRef } from 'react';

const Desktop: React.FC = ({ children }) => {
  const desktopRef = useRef<HTMLElement>(null);

  // TODO: useWallpaper();
  useEffect(() => {
    const wallpaperEffect = renderWallpaperEffect(desktopRef);

    return () => {
      wallpaperEffect?.destroy();
    };
  }, []);

  return (
    <main className={styles.desktop} ref={desktopRef}>
      {children}
    </main>
  );
};

export default Desktop;
