import styles from '@/styles/Programs/Dos.module.scss';

import type { AppComponent } from '@/types/utils/programs';
import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { DosMainFn, DosRuntime } from 'js-dos';
import type { WindowWithDosModule } from '@/types/components/Programs/dos';

import { focusClosestFocusableElementFromRef } from '@/utils/elements';
import { getLockedAspectRatioDimensions } from '@/utils/dos';
import { useEffect, useRef } from 'react';
import { TITLEBAR_HEIGHT } from '@/utils/constants';

const defaultDimensions = {
  width: 640,
  height: 400 + TITLEBAR_HEIGHT
};

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  /* eslint @typescript-eslint/no-empty-function: off */
  onprogress: () => {}
};

const Dos: React.FC<AppComponent> = ({
  args,
  file: { url, name = '' } = {},
  maximized
}) => {
  let ci: DosCommandInterface;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadMain = (main: DosMainFn, prependedArgs: string[] = []) =>
    main([...prependedArgs, ...['-c', args?.get('-c') || 'CLS']]).then(
      (value) => {
        ci = value;
      }
    );
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
    ? getLockedAspectRatioDimensions(
        defaultDimensions.width,
        defaultDimensions.height
      )
    : {};

  useEffect(() => {
    const { current: canvasElement } = canvasRef as {
      current: HTMLCanvasElement;
    };
    const { Dos: DosModule } = window as WindowWithDosModule;

    DosModule(canvasElement, {
      autolock: !!args?.get('autolock'),
      ...dosOptions
    }).then(loadDos);

    return () => {
      ci?.exit();
    };
  }, []);

  /* eslint global-require: off */
  require('js-dos');

  return (
    <article className={styles.dos} style={maximizedStyle}>
      <canvas
        onTouchStart={focusClosestFocusableElementFromRef(canvasRef)}
        onClick={focusClosestFocusableElementFromRef(canvasRef)}
        ref={canvasRef}
      />
    </article>
  );
};

export default Dos;

export const loaderOptions = {
  lockAspectRatio: true,
  bgColor: '#000',
  ...defaultDimensions
};
