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
  wdosboxUrl: '/libs/wdosbox.js'
};

// TODO: Lock canvas to window width
// TODO: Fix transparent border around canvas / below title bar
// TODO: Loading screen until game is running

const lockDocumentTitle = () =>
  Object.defineProperty(document, 'title', { set: () => {} });

const Dos: FC<DosApp> = ({ args, url }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let ci: DosCommandInterface;

    lockDocumentTitle();

    (window as DosWindow)
      .Dos(canvasRef.current as HTMLCanvasElement, dosOptions)
      .then(({ fs, main }) =>
        fs.extract(url).then(async () => (ci = await main(args)))
      );

    return () => {
      ci.exit();
    };
  }, []);

  require('js-dos');

  return <canvas ref={canvasRef} />;
};

export default Dos;
