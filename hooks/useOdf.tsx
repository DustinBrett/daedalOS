import {
  MAXIMIZE_ANIMATION_SPEED_IN_SECONDS,
  MILLISECONDS_IN_SECOND
} from '@/utils/constants';
import { useEffect, useState } from 'react';
import { OdfLib, WindowWithWebOdf } from '@/types/hooks/useOdf';

const useOdf = ({
  odfElementRef,
  url
}: {
  odfElementRef: React.RefObject<HTMLElement>;
  url: string;
}): OdfLib | null => {
  const [odfLib, setOdfLib] = useState<OdfLib | null>(null);

  useEffect(() => {
    const lib = document.createElement('script');

    lib.src = '/libs/webodf.js';
    lib.type = 'text/javascript';
    lib.onload = () => {
      const { current: odfCanvasElement } = odfElementRef;

      if (odfCanvasElement) {
        setTimeout(() => {
          const newOdfLib = new (window as WindowWithWebOdf).odf.OdfCanvas(
            odfCanvasElement
          );

          newOdfLib.load(url);
          setOdfLib(newOdfLib);
        }, MAXIMIZE_ANIMATION_SPEED_IN_SECONDS * MILLISECONDS_IN_SECOND);
      }
    };

    document.head.appendChild(lib);

    return () => {
      document.head.removeChild(lib);
    };
  }, []);

  return odfLib;
};

export default useOdf;
