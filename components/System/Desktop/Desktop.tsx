import styles from '@/styles/System/Desktop.module.scss';

import type { FC } from 'react';
import type { WallpaperEffect } from '@/components/System/Desktop/Wallpaper';

import { useEffect, useRef, useState } from 'react';

export const Desktop: FC = ({ children }) => {
  const desktopRef = useRef(null),
    [wallpaperEffect, setWallpaperEffect] = useState<WallpaperEffect>();

  useEffect(() => {
    import('@/components/System/Desktop/Wallpaper').then(
      ({ renderWallpaperEffect }) => {
        setWallpaperEffect(renderWallpaperEffect(desktopRef));
      }
    );

    return () => {
      wallpaperEffect?.destroy();
    };
  }, [desktopRef]);

  return (
    <main className={styles.desktop} ref={desktopRef}>
      {children}
    </main>
  );
};

export default Desktop;
