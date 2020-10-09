import styles from '@/styles/System/Desktop/Desktop.module.scss';

import type { WallpaperEffect } from '@/types/components/System/Desktop/Wallpaper';

import { renderWallpaperEffect } from '@/components/System/Desktop/Wallpaper';
import { useEffect, useRef, useState } from 'react';

const Desktop: React.FC = ({ children }) => {
  const desktopRef = useRef<HTMLElement>(null);
  const [wallpaperEffect, setWallpaperEffect] = useState<WallpaperEffect>();

  useEffect(() => {
    setWallpaperEffect(renderWallpaperEffect(desktopRef));

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
