import type { DosFactory } from 'js-dos';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import DosIcon from '../assets/svg/dos.svg';
import App from '../contexts/App';

const game = {
  file: 'Commander_Keen_1_-_Marooned_on_Mars_1990.zip',
  cmd: ['-c', 'CD CKEEN1', '-c', 'KEEN1.EXE']
};

const DosApp: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    require('js-dos');

    if (window) {
      const { Dos } = (window || {}) as Window &
        typeof globalThis & { Dos: DosFactory };

      Dos(canvasRef?.current as HTMLCanvasElement, {
        wdosboxUrl: '/libs/wdosbox-nosync.js'
      }).ready((fs, main) => {
        fs.extract(`/games/${game.file}`).then(() => main(game.cmd));
      });
    }
  }, []);

  return <canvas ref={canvasRef} />;
};

export default new App(DosApp, <DosIcon />, 'dos', 'DOS');
