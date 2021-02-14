import { useContext, useEffect } from 'react';
import { ThemeContext } from 'styled-components';

const useWallpaper = (
  desktopRef: React.RefObject<HTMLElement | null>
): void => {
  const { wallpaper } = useContext(ThemeContext);

  useEffect(() => wallpaper?.(desktopRef.current), [desktopRef, wallpaper]);
};

export default useWallpaper;
