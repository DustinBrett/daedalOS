import {
  MAXIMIZE_ANIMATION_SPEED_IN_SECONDS,
  MILLISECONDS_IN_SECOND
} from '@/utils/constants';
import { useEffect } from 'react';

type WindowWithWebOdf = Window &
  typeof globalThis & {
    odf: {
      OdfCanvas: new (element: HTMLElement) => { load: (url: string) => void };
    };
  };

const useOdf = ({
  odfElementRef,
  url
}: {
  odfElementRef: React.RefObject<HTMLElement>;
  url: string;
}): void => {
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
};

export default useOdf;
