import styles from '@/styles/Programs/Dos.module.scss';

import type { DosMainFn } from 'js-dos';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { FC } from 'react';
import type { AppComponent } from '@/types/utils/programs';
import type { ProcessState } from '@/types/utils/processmanager';
import type { WindowWithDosModule } from '@/types/components/Programs/dos';

import { useEffect, useRef } from 'react';
import { getLockedAspectRatioDimensions } from '@/utils/windowmanager';

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  /* eslint @typescript-eslint/no-empty-function: off */
  onprogress: () => {}
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadMain = (main: DosMainFn, prependedArgs: string[] = []) =>
    main([...prependedArgs, ...args]).then((value) => {
      ci = value;
    });
  const focusCanvas = () => {
    (canvasRef.current?.closest(
      ':not(li)[tabindex]'
    ) as HTMLDivElement).focus();
  };

  useEffect(() => {
    const { current: canvasElement } = canvasRef as {
      current: HTMLCanvasElement;
    };
    const { Dos: DosModule } = window as WindowWithDosModule;

    DosModule(canvasElement, dosOptions).then(({ fs, main }) => {
      if (url) {
        const appPath = name.replace(/ /g, '').substring(0, 8);

        fs.extract(url, appPath).then(() =>
          loadMain(main, ['-c', `CD ${appPath}`])
        );
      } else {
        loadMain(main);
      }
    });

    return () => {
      ci?.exit();
    };
  }, []);

  require('js-dos');

  return (
    <div
      className={styles.dos}
      {...(maximized
        ? {
            style: getLockedAspectRatioDimensions(
              loaderOptions.width,
              loaderOptions.height
            )
          }
        : {})}
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
