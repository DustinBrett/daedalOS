import styles from '@/styles/Programs/Dos.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import useDos from '@/hooks/useDos';
import { focusClosestFocusableElementFromRef } from '@/utils/elements';
import { getLockedAspectRatioDimensions } from '@/utils/dos';
import { useRef } from 'react';
import { TITLEBAR_HEIGHT } from '@/utils/constants';

const defaultDimensions = {
  width: 640,
  height: 400 + TITLEBAR_HEIGHT
};

const Dos: React.FC<AppComponent> = ({ file: { url } = {}, maximized }) => {
  const containerRef = useRef<HTMLElement>(null);
  const maximizedStyle = maximized
    ? getLockedAspectRatioDimensions(
        defaultDimensions.width,
        defaultDimensions.height
      )
    : {};

  useDos({ containerRef, url });

  return (
    <article
      className={styles.dos}
      style={maximizedStyle}
      onTouchStart={focusClosestFocusableElementFromRef(containerRef)}
      onClick={focusClosestFocusableElementFromRef(containerRef)}
      ref={containerRef}
    />
  );
};

export default Dos;

export const loaderOptions = {
  lockAspectRatio: true,
  bgColor: '#000',
  ...defaultDimensions
};
