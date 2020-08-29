import styles from '@/styles/Desktop.module.scss';

import type { FC } from 'react';
import type { WallpaperEffect } from '@/components/Wallpaper';
import { useEffect, useRef, useState } from 'react';
import { renderWallpaperEffect } from '@/components/Wallpaper';
import Color from 'color';

const initialColor = Math.floor(Math.random() * (256 - 200 + 1)) + 200;

const wallpaperColor = (h: number): number =>
  Color(`hsl(${h}, 35%, 25%)`).rgbNumber();

export const Desktop: FC = ({ children }) => {
  const desktopRef = useRef(null),
    [wallpaperEffect, setWallpaperEffect] = useState<WallpaperEffect>();

  useEffect(() => {
    setWallpaperEffect(
      renderWallpaperEffect(desktopRef, wallpaperColor(initialColor))
    );

    return () => {
      wallpaperEffect?.destroy();
    };
  }, []);

  useEffect(() => {
    if (wallpaperEffect) {
      let h = initialColor,
        increment = true;
      const colorIntervalId = setInterval(() => {
        if (h === 0) increment = true;
        else if (h === 255) increment = false;

        wallpaperEffect.options.color = wallpaperColor(
          (h = increment ? h + 1 : h - 1)
        );
      }, 1000);

      return () => {
        clearInterval(colorIntervalId);
      };
    }
  }, [wallpaperEffect]);

  return (
    <main className={styles.desktop} ref={desktopRef}>
      {children}
    </main>
  );
};
