import styles from '@/styles/Programs/Dos.module.scss';

import type { DosFactory, DosMainFn } from 'js-dos';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { FC } from 'react';
import type { AppComponent } from '@/utils/programs.d';

import { useEffect, useRef } from 'react';

type DosWindow = Window & typeof globalThis & { Dos: DosFactory };

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  onprogress: () => {}
};

export const loaderOptions = {
  hideScrollbars: true,
  lockAspectRatio: true,
  width: 320,
  height: 224,
  bgColor: '#fff'
};

export const Dos: FC<AppComponent> = ({ args = ['-c', 'CLS'], url }) => {
  let ci: DosCommandInterface;
  const canvasRef = useRef<HTMLCanvasElement>(null),
    loadMain = (main: DosMainFn, prependedArgs: Array<string> = []) => () =>
      main?.([...prependedArgs, ...args])?.then((value) => {
        ci = value;
      }),
    focusCanvas = () => {
      (canvasRef.current?.closest(
        ':not(li)[tabindex]'
      ) as HTMLDivElement).focus();
    };

  useEffect(() => {
    const { current: canvasElement } = canvasRef as {
        current: HTMLCanvasElement;
      },
      { Dos } = window as DosWindow;

    Dos(canvasElement, dosOptions)?.then(({ fs, main }) => {
      if (url) {
        const appPath = url.replace('.jsdos', '');

        fs?.extract?.(url, appPath)?.then(
          loadMain(main, ['-c', `CD ${appPath}`])
        );
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
      onTouchStart={focusCanvas}
      onClick={focusCanvas}
      ref={canvasRef}
    />
  );
};

export default Dos;
