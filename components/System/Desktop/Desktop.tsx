import styles from '@/styles/System/Desktop/Desktop.module.scss';

import type { FC } from 'react';
import type { WallpaperEffect } from '@/components/System/Desktop/Wallpaper.d';

import { useEffect, useRef, useState } from 'react';
import { renderWallpaperEffect } from '@/components/System/Desktop/Wallpaper';

const Desktop: FC = ({ children }) => {
  const desktopRef = useRef<HTMLElement>(null),
    [wallpaperEffect, setWallpaperEffect] = useState<WallpaperEffect>();

  useEffect(() => {
    setWallpaperEffect(renderWallpaperEffect(desktopRef));

    return () => {
      wallpaperEffect?.destroy();
    };
  }, [desktopRef]);

  return (
    <main className={styles.desktop} style={{ zIndex: 1000 }} ref={desktopRef}>
      {children}
    </main>
  );
};

export default Desktop;
