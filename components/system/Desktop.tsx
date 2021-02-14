import useWallpaper from 'hooks/useWallpaper';
import { useRef } from 'react';
import StyledDesktop from 'styles/components/system/StyledDesktop';

const Desktop: React.FC = ({ children }) => {
  const desktopRef = useRef<HTMLElement | null>(null);

  useWallpaper(desktopRef);

  return (
    <StyledDesktop ref={desktopRef} role="main">
      {children}
    </StyledDesktop>
  );
};

export default Desktop;
