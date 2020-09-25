import styles from '@/styles/System/Desktop/Desktop.module.scss';

import type { FC } from 'react';
import type { WallpaperEffect } from '@/types/components/System/Desktop/Wallpaper';

import { useContext, useEffect, useRef, useState } from 'react';
import { renderWallpaperEffect } from '@/components/System/Desktop/Wallpaper';
import { useFileDrop } from '@/utils/events';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';

// TODO: Move drag/drop into directory
const Desktop: FC = ({ children }) => {
  const desktopRef = useRef<HTMLElement>(null),
    [wallpaperEffect, setWallpaperEffect] = useState<WallpaperEffect>(),
    { load } = useContext(ProcessContext),
    { getState } = useContext(SessionContext),
    fileDropHandler = useFileDrop(({ pageX, pageY }, file) => {
      load(file, getState({ name }), { startX: pageX, startY: pageY });
    });

  useEffect(() => {
    setWallpaperEffect(renderWallpaperEffect(desktopRef));

    return () => {
      wallpaperEffect?.destroy();
    };
  }, [desktopRef]);

  return (
    <main className={styles.desktop} ref={desktopRef} {...fileDropHandler}>
      {children}
    </main>
  );
};

export default Desktop;
