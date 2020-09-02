import styles from '@/styles/System/Desktop.module.scss';

import type { FC } from 'react';
import type { WallpaperEffect } from '@/components/System/Wallpaper';

import { useEffect, useRef, useState } from 'react';
import { renderWallpaperEffect } from '@/components/System/Wallpaper';

// clicking desktop should clean all apps of foreground

export const Desktop: FC = ({ children }) => {
  const desktopRef = useRef(null),
    [wallpaperEffect, setWallpaperEffect] = useState<WallpaperEffect>();

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
