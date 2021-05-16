import { getWebampElement } from 'components/apps/Webamp/functions';
import useWebamp from 'components/apps/Webamp/useWebamp';
import type { ComponentProcessProps } from 'components/system/Apps/RenderComponent';
import { useFileSystem } from 'contexts/fileSystem';
import { useProcesses } from 'contexts/process';
import { useEffect, useRef } from 'react';
import { loadFiles } from 'utils/functions';

const Webamp = ({ id }: ComponentProcessProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { fs } = useFileSystem();
  const { processes: { [id]: { minimized = false, url = '' } = {} } = {} } =
    useProcesses();
  const { loadWebamp } = useWebamp(id);

  useEffect(() => {
    if (fs) {
      fs?.readFile(url, (_error, contents) => {
        loadFiles([
          '/libs/webamp/butterchurn.min.js',
          '/libs/webamp/butterchurnPresets.min.js',
          '/libs/webamp/webamp.bundle.min.js'
        ]).then(() => loadWebamp(containerRef?.current, contents));
      });
    }
  }, [containerRef, fs, loadWebamp, url]);

  // TODO: Replace with Framer animation
  useEffect(() => {
    const webamp = getWebampElement();

    if (webamp) {
      webamp.style.display = minimized ? 'none' : 'block';
    }
  }, [minimized]);

  return <div ref={containerRef} />;
};

export default Webamp;
