import type { AppComponent } from '@/types/utils/programs';

import { useEffect, useRef } from 'react';

type WindowWithWebOdf = Window & typeof globalThis & { odf: any };

const WebODF: React.FC<AppComponent> = () => {
  const odfElementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const lib = document.createElement('script');

    lib.src = '/libs/webodf.js';
    lib.type = 'text/javascript';
    lib.onload = () => {
      const odfCanvas = new (window as WindowWithWebOdf).odf.OdfCanvas(
        odfElementRef.current
      );

      // TODO: Wait for opening animation to finish
      odfCanvas.load('/docs/welcome.odt');
    };

    document.head.appendChild(lib);

    return () => {
      document.head.removeChild(lib);
    };
  }, []);

  return <article ref={odfElementRef} />;
};

export default WebODF;

export const loaderOptions = {};
