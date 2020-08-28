import styles from '@/styles/Dos.module.scss';

import type { DosFactory } from 'js-dos';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

type DosWindow = Window & typeof globalThis & { Dos: DosFactory };

type DosApp = {
  args: string[];
  url: string;
};

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  onprogress: () => {}
};

// TODO: Loading screen until game is running

const DOS: FC<DosApp> = ({ args, url }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let ci: DosCommandInterface;

    (window as DosWindow)
      .Dos(canvasRef.current as HTMLCanvasElement, dosOptions)
      .then(({ fs, main }) =>
        fs.extract(url).then(async () => {
          ci = await main(args);
        })
      );

    return () => {
      ci.exit();
    };
  }, []);

  require('js-dos');

  return <canvas className={styles.dos} ref={canvasRef} />;
};

export default DOS;
