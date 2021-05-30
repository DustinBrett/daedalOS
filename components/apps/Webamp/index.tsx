import {
  focusWindow,
  setZIndex,
  unFocus
} from 'components/apps/Webamp/functions';
import StyledWebamp from 'components/apps/Webamp/StyledWebamp';
import useWebamp from 'components/apps/Webamp/useWebamp';
import type { ComponentProcessProps } from 'components/system/Apps/RenderComponent';
import useWindowTransitions from 'components/system/Window/useWindowTransitions';
import { useFileSystem } from 'contexts/fileSystem';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useEffect, useMemo, useRef } from 'react';
import { loadFiles } from 'utils/functions';

const Webamp = ({ id }: ComponentProcessProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { fs } = useFileSystem();
  const {
    processes: {
      [id]: { minimized = false, taskbarEntry = undefined, url = '' } = {}
    } = {}
  } = useProcesses();
  const { loadWebamp, webampCI } = useWebamp(id);
  const { foregroundId, setForegroundId, setStackOrder, stackOrder } =
    useSession();
  const windowTransitions = useWindowTransitions(id, containerRef);
  const zIndex = useMemo(
    () => stackOrder.length + (minimized ? 1 : -stackOrder.indexOf(id)) + 1,
    [id, minimized, stackOrder]
  );

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

  useEffect(() => containerRef?.current?.focus(), []);

  useEffect(() => {
    if (webampCI) {
      if (
        foregroundId === id &&
        !containerRef?.current?.contains(document.activeElement)
      ) {
        focusWindow(webampCI, 'main');
        containerRef?.current?.focus();
      }

      setZIndex(webampCI, zIndex);
    }
  }, [foregroundId, id, stackOrder, webampCI, zIndex]);

  return (
    <StyledWebamp
      ref={containerRef}
      tabIndex={-1}
      onFocus={() => {
        setStackOrder((currentStackOrder) => [
          id,
          ...currentStackOrder.filter((stackId) => stackId !== id)
        ]);
        setForegroundId(id);
      }}
      onBlur={({ relatedTarget }) => {
        if (foregroundId === id && relatedTarget !== taskbarEntry) {
          setForegroundId('');
        }

        if (webampCI) unFocus(webampCI);
      }}
      {...windowTransitions}
    />
  );
};

export default Webamp;
