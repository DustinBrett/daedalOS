import styles from '@/styles/Programs/Dos.module.scss';

import type { DosFactory, DosMainFn } from 'js-dos';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { FC } from 'react';
import type { AppComponent } from '@/utils/programs.d';
import type { ProcessState } from '@/utils/processmanager.d';

import { useEffect, useRef } from 'react';

type DosWindow = Window & typeof globalThis & { Dos: DosFactory };

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  onprogress: () => {}
};

// TODO: Clean up hardcoded taskbar/titlebar heights
const getLockedAspectRatioDimensions = () => {
  const aspectRatio = loaderOptions.width / (loaderOptions.height - 24),
    widerWidth = window.innerWidth / window.innerHeight < aspectRatio;

  return {
    width: widerWidth ? '100%' : (window.innerHeight - 24 - 30) * aspectRatio,
    height: widerWidth ? 'unset' : '100%'
  };
};

export const loaderOptions = {
  hideScrollbars: true,
  lockAspectRatio: true,
  width: 640,
  height: 400 + 24, // TODO: 24 is titlebar height
  bgColor: '#000000'
};

export const Dos: FC<AppComponent & ProcessState> = ({
  args = ['-c', 'CLS'],
  file: { url, name = '' } = {},
  maximized
}) => {
  let ci: DosCommandInterface;
  const canvasRef = useRef<HTMLCanvasElement>(null),
    loadMain = (main: DosMainFn, prependedArgs: Array<string> = []) =>
      main?.([...prependedArgs, ...args])?.then((value) => {
        ci = value;
      }),
    // TODO: Set app to foreground instead of manually focusing
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
        const appPath = name.replace(/ /g, '').substring(0, 8);

        fs?.extract?.(url, appPath)?.then(() =>
          loadMain(main, ['-c', `CD ${appPath}`])
        );
      } else {
        loadMain(main);
      }
    });

    return () => {
      ci?.exit();
    };
  }, [canvasRef]);

  require('js-dos');

  return (
    <div
      className={styles.dos}
      {...(maximized ? { style: getLockedAspectRatioDimensions() } : {})}
    >
      <canvas
        onTouchStart={focusCanvas}
        onClick={focusCanvas}
        ref={canvasRef}
      />
    </div>
  );
};

export default Dos;
