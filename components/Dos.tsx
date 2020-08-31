import styles from '@/styles/Dos.module.scss';
import DosIcon from '@/assets/icons/Dos.png';

import type { DosFactory, DosMainFn } from 'js-dos';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { FC } from 'react';

import App, { AppComponent } from '@/contexts/App';
import { useEffect, useRef } from 'react';

type DosWindow = Window & typeof globalThis & { Dos: DosFactory };

type DosApp = {
  args?: Array<string>;
  url?: string;
};

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  onprogress: () => {}
};

export const DosAppLoader: FC<DosApp> = ({ args, url }) => {
  let ci: DosCommandInterface;
  const canvasRef = useRef<HTMLCanvasElement>(null),
    loadMain = (main: DosMainFn) => () =>
      main(args).then((value) => {
        ci = value;
      });

  useEffect(() => {
    const { current: canvasElement } = canvasRef as {
        current: HTMLCanvasElement;
      },
      { Dos } = window as DosWindow;

    Dos(canvasElement, dosOptions).then(({ fs, main }) => {
      if (url) {
        fs.extract(url).then(loadMain(main));
      } else {
        loadMain(main)();
      }
    });

    return () => {
      ci?.exit();
    };
  }, [canvasRef]);

  require('js-dos');

  return <canvas className={styles.dos} ref={canvasRef} />;
};

export default new App({
  component: DosAppLoader as FC<AppComponent>,
  icon: DosIcon,
  name: 'DOS',
  hideScrollbars: true,
  lockAspectRatio: true
});
