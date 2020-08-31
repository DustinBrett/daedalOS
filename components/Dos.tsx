import styles from '@/styles/Dos.module.scss';
import DosIcon from '@/assets/icons/Dos.png';

import type { DosFactory, DosMainFn } from 'js-dos';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { FC } from 'react';
import App, { AppComponent } from '@/contexts/App';
import { useEffect, useRef } from 'react';

type DosWindow = Window & typeof globalThis & { Dos: DosFactory };

type DosApp = {
  args?: string[];
  url?: string;
};

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  onprogress: () => {}
};

// TODO: Minimize is not killing DOS properly
// TODO: Close on `EXIT` => `SDL_Quit called (and ignored)`

export const DosAppLoader: FC<DosApp> = ({ args, url }) => {
  let ci: DosCommandInterface;
  const canvasRef = useRef<HTMLCanvasElement>(null),
    loadMain = (main: DosMainFn) => () =>
      main(args).then((value) => {
        ci = value;
      });

  useEffect(() => {
    (window as DosWindow)
      .Dos(canvasRef.current as HTMLCanvasElement, dosOptions)
      .then(({ fs, main }) => {
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
  hideScrollbars: true
});
