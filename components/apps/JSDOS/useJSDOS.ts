import type { DosCI, WindowWithDos } from 'components/apps/JSDOS/types';
import useTitle from 'components/system/Window/useTitle';
import useWindowSize from 'components/system/Window/useWindowSize';
import { useFileSystem } from 'contexts/fileSystem';
import { useEffect, useState } from 'react';
import { bufferToUrl, cleanUpBufferUrl, loadFiles } from 'utils/functions';

const useJSDOS = (
  id: string,
  url: string,
  screenRef: React.MutableRefObject<HTMLDivElement | null>
): void => {
  const { appendFileToTitle } = useTitle(id);
  const { updateWindowSize } = useWindowSize(id);
  const [dos, setDos] = useState<DosCI | null>(null);
  const { fs } = useFileSystem();

  useEffect(() => {
    if (!dos && fs && url && screenRef?.current) {
      fs.readFile(url, (_error, contents = Buffer.from('')) =>
        loadFiles(['/libs/jsdos/js-dos.js', '/libs/jsdos/js-dos.css']).then(
          () => {
            const DosWindow = window as WindowWithDos;
            const objectURL = bufferToUrl(contents);

            DosWindow.emulators.pathPrefix = '/libs/jsdos/';
            DosWindow.Dos(screenRef.current as HTMLDivElement)
              .run(objectURL)
              .then((ci) => {
                appendFileToTitle(url);
                cleanUpBufferUrl(objectURL);
                setDos(ci);
              });
          }
        )
      );
    }

    return () => dos?.exit();
  }, [appendFileToTitle, dos, fs, screenRef, url]);

  useEffect(() => {
    if (dos) {
      updateWindowSize(dos.frameHeight, dos.frameWidth);

      dos
        .events()
        .onFrameSize((width, height) =>
          updateWindowSize(height * 2, width * 2)
        );
    }
  }, [dos, updateWindowSize]);
};

export default useJSDOS;
