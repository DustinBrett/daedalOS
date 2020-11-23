import styles from '@/styles/Programs/WebODF.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import useOdf from '@/hooks/useOdf';
import { useEffect, useRef } from 'react';

const WebODF: React.FC<AppComponent> = ({
  url: appUrl,
  file: { url = '/docs/welcome.odt' } = {}
}) => {
  const odfElementRef = useRef<HTMLElement>(null);
  const odfLib = useOdf({ odfElementRef, url });

  useEffect(() => {
    if (appUrl && odfLib) {
      odfLib.load(appUrl);
    }
  }, [appUrl, odfLib]);

  return <article className={styles.webOdf} ref={odfElementRef} />;
};

export default WebODF;

export const loaderOptions = {
  width: 450,
  height: 500
};
