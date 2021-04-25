import type { FSModule } from 'browserfs/dist/node/core/FS';
import {
  defaultConfig,
  libs,
  pathPrefix,
  zipConfigPath
} from 'components/apps/JSDOS/config';
import type { DosCI } from 'components/apps/JSDOS/types';
import { addFileToZip, isFileInZip } from 'components/apps/JSDOS/zipFunctions';
import useTitle from 'components/system/Window/useTitle';
import useWindowSize from 'components/system/Window/useWindowSize';
import { useFileSystem } from 'contexts/fileSystem';
import { extname } from 'path';
import { useEffect, useState } from 'react';
import { bufferToUrl, cleanUpBufferUrl, loadFiles } from 'utils/functions';

const addJsDosConfig = async (buffer: Buffer, fs: FSModule): Promise<Buffer> =>
  (await isFileInZip(buffer, zipConfigPath))
    ? buffer
    : addFileToZip(buffer, defaultConfig, zipConfigPath, fs);

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
        loadFiles(libs).then(async () => {
          const isZip = extname(url).toLowerCase() === '.zip';
          const objectURL = bufferToUrl(
            isZip ? await addJsDosConfig(contents, fs) : contents
          );

          window.emulators.pathPrefix = pathPrefix;
          window
            .Dos(screenRef.current as HTMLDivElement)
            .run(objectURL)
            .then((ci) => {
              appendFileToTitle(url);
              cleanUpBufferUrl(objectURL);
              setDos(ci);
            });
        })
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
