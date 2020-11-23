import type { DosCommandInterface } from 'js-dos/dist/typescript/js-dos-ci';
import type { DosFS } from 'js-dos/dist/typescript/js-dos-fs';
import type { DosMainFn, DosRuntime } from 'js-dos';
import type { WindowWithDosModule } from '@/types/components/Programs/dos';

import { useEffect, useState } from 'react';

const dosOptions = {
  wdosboxUrl: '/libs/wdosbox.js',
  /* eslint @typescript-eslint/no-empty-function: off */
  onprogress: () => {}
};

const useDos = ({
  args,
  canvasRef,
  name,
  url
}: {
  args: URLSearchParams | undefined;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  name: string;
  url?: string;
}): void => {
  const [dosCi, setDosCi] = useState<DosCommandInterface | null>(null);
  const loadMain = (main: DosMainFn, prependedArgs: string[] = []) => {
    const loadArgs = args?.get('-c')
      ? args
          ?.getAll('-c')
          .map((value) => ['-c', value])
          .flat() || []
      : ['-c', 'CLS'];

    main([...prependedArgs, ...loadArgs]).then((value) => {
      setDosCi(value);
    });
  };
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

  useEffect(() => {
    const { current: canvasElement } = canvasRef as {
      current: HTMLCanvasElement;
    };
    const { Dos: DosModule } = window as WindowWithDosModule;

    DosModule(canvasElement, {
      autolock: !!args?.get('autolock'),
      ...dosOptions
    }).then(loadDos);
  }, []);

  useEffect(() => () => {
    dosCi?.exit();
  }, [dosCi]);

  /* eslint global-require: off */
  require('js-dos');
};

export default useDos;
