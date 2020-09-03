import styles from '@/styles/Apps/Dos.module.scss';
import DosIcon from '@/assets/icons/Dos.png';

import type { DosFactory, DosMainFn } from 'js-dos';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { FC } from 'react';

import App, { AppComponent } from '@/contexts/App';
import { useEffect, useRef } from 'react';
import { Html } from 'next/document';

type DosWindow = Window & typeof globalThis & { Dos: DosFactory };

type DosApp = {
  args?: Array<string>;
  url?: string;
};

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  onprogress: () => {}
};

export const DosAppLoader: FC<DosApp> = ({ args = ['-c', 'CLS'], url }) => {
  let ci: DosCommandInterface;
  const canvasRef = useRef<HTMLCanvasElement>(null),
    loadMain = (main: DosMainFn) => () =>
      main(args)?.then((value) => {
        ci = value;
      });

  useEffect(() => {
    const { current: canvasElement } = canvasRef as {
        current: HTMLCanvasElement;
      },
      { Dos } = window as DosWindow;

    Dos(canvasElement, dosOptions)?.then(({ fs, main }) => {
      if (url) {
        fs?.extract(url)?.then(loadMain(main));
      } else {
        loadMain(main)();
      }
    });

    return () => {
      ci?.exit();
    };
  }, [canvasRef]);

  require('js-dos');

  return (
    <canvas
      className={styles.dos}
      onClick={() => {
        (canvasRef.current?.closest(':not(li)[tabindex]') as HTMLDivElement).focus();
      }}
      ref={canvasRef}
    />
  );
};

export const DosAppOptions: Partial<App> = {
  hideScrollbars: true,
  lockAspectRatio: true,
  width: 320,
  height: 224
};

export default new App({
  component: DosAppLoader as FC<AppComponent>,
  icon: DosIcon,
  name: 'DOS',
  ...DosAppOptions
});
