import styles from '@/styles/Programs/WebODF.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import {
  MAXIMIZE_ANIMATION_SPEED_IN_SECONDS,
  MILLISECONDS_IN_SECOND
} from '@/utils/constants';
import { useEffect, useRef } from 'react';

type WindowWithWebOdf = Window &
  typeof globalThis & {
    odf: {
      OdfCanvas: new (element: HTMLElement) => { load: (url: string) => void };
    };
  };

const WebODF: React.FC<AppComponent> = ({
  file: { url = '/docs/welcome.odt' } = {}
}) => {
  const odfElementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const lib = document.createElement('script');

    lib.src = '/libs/webodf.js';
    lib.type = 'text/javascript';
    lib.onload = () => {
      const { current: odfCanvasElement } = odfElementRef;

      if (odfCanvasElement) {
        setTimeout(
          () =>
            new (window as WindowWithWebOdf).odf.OdfCanvas(
              odfCanvasElement
            ).load(url),
          MAXIMIZE_ANIMATION_SPEED_IN_SECONDS * MILLISECONDS_IN_SECOND
        );
      }
    };

    document.head.appendChild(lib);

    return () => {
      document.head.removeChild(lib);
    };
  }, []);

  return <article className={styles.webOdf} ref={odfElementRef} />;
};

export default WebODF;

export const loaderOptions = {
  width: 450,
  height: 500
};
