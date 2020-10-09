import styles from '@/styles/Programs/Dos.module.scss';

import type { DosMainFn, DosRuntime } from 'js-dos';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { AppComponent } from '@/types/utils/programs';
import type { WindowWithDosModule } from '@/types/components/Programs/dos';

import { useEffect, useRef } from 'react';
import { getLockedAspectRatioDimensions } from '@/utils/dos';
import { TITLEBAR_HEIGHT } from '@/utils/constants';
import { focusClosestFocusableElementFromRef } from '@/utils/elements';

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  /* eslint @typescript-eslint/no-empty-function: off */
  onprogress: () => {}
};

export const loaderOptions = {
  lockAspectRatio: true,
  width: 640,
  height: 400 + TITLEBAR_HEIGHT,
  bgColor: '#000000'
};

const Dos: React.FC<AppComponent> = ({
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
  const loadDos = ({ fs, main }: DosRuntime) => {
    if (url) {
      const appPath = name.replace(/ /g, '').substring(0, 8);

      fs.extract(url, appPath).then(() =>
        loadMain(main, ['-c', `CD ${appPath}`])
      );
    } else {
      loadMain(main);
    }
  };
  const maximizedStyle = maximized
    ? getLockedAspectRatioDimensions(loaderOptions.width, loaderOptions.height)
    : {};

  useEffect(() => {
    const { current: canvasElement } = canvasRef as {
      current: HTMLCanvasElement;
    };
    const { Dos: DosModule } = window as WindowWithDosModule;

    DosModule(canvasElement, dosOptions).then(loadDos);

    return () => {
      ci?.exit();
    };
  }, []);

  /* eslint global-require: off */
  require('js-dos');

  return (
    <div className={styles.dos} style={maximizedStyle}>
      <canvas
        onTouchStart={focusClosestFocusableElementFromRef(canvasRef)}
        onClick={focusClosestFocusableElementFromRef(canvasRef)}
        ref={canvasRef}
      />
    </div>
  );
};

export default Dos;
