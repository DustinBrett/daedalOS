import styles from '@/styles/Programs/WebODF.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import useOdf from '@/hooks/useOdf';
import { useRef } from 'react';

const WebODF: React.FC<AppComponent> = ({
  file: { url = '/docs/welcome.odt' } = {}
}) => {
  const odfElementRef = useRef<HTMLElement>(null);

  useOdf({ odfElementRef, url });

  return <article className={styles.webOdf} ref={odfElementRef} />;
};

export default WebODF;

export const loaderOptions = {
  width: 450,
  height: 500
};
