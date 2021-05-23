import {
  focusWindow,
  getWebampElement,
  setZIndex,
  unFocus
} from 'components/apps/Webamp/functions';
import useWebamp from 'components/apps/Webamp/useWebamp';
import type { ComponentProcessProps } from 'components/system/Apps/RenderComponent';
import { useFileSystem } from 'contexts/fileSystem';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useEffect, useRef } from 'react';
import { loadFiles } from 'utils/functions';

const Webamp = ({ id }: ComponentProcessProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { fs } = useFileSystem();
  const { processes: { [id]: { minimized = false, url = '' } = {} } = {} } =
    useProcesses();
  const { loadWebamp, webampCI } = useWebamp(id);
  const { foregroundId, setForegroundId } = useSession();

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

  useEffect(() => containerRef?.current?.focus(), []);

  useEffect(() => {
    if (webampCI) {
      if (foregroundId === id) {
        if (!containerRef?.current?.contains(document.activeElement)) {
          focusWindow(webampCI, 'main');
          containerRef?.current?.focus();
        }

        setZIndex(webampCI, 3);
      } else if (foregroundId) {
        setZIndex(webampCI, 1);
      }
    }
  }, [foregroundId, id, webampCI]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onFocus={() => setForegroundId(id)}
      onBlur={() => {
        setForegroundId('');
        if (webampCI) unFocus(webampCI);
      }}
    />
  );
};

export default Webamp;
