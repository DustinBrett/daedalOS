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

const Dos: React.FC<AppComponent> = ({
  args,
  file: { url, name = '' } = {},
  maximized
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maximizedStyle = maximized
    ? getLockedAspectRatioDimensions(
        defaultDimensions.width,
        defaultDimensions.height
      )
    : {};

  useDos({ args, canvasRef, name, url });

  return (
    <article className={styles.dos} style={maximizedStyle}>
      <canvas
        onTouchStart={focusClosestFocusableElementFromRef(canvasRef)}
        onClick={focusClosestFocusableElementFromRef(canvasRef)}
        ref={canvasRef}
      />
    </article>
  );
};

export default Dos;

export const loaderOptions = {
  lockAspectRatio: true,
  bgColor: '#000',
  ...defaultDimensions
};
