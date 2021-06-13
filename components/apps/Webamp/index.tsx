import { focusWindow, unFocus } from 'components/apps/Webamp/functions';
import StyledWebamp from 'components/apps/Webamp/StyledWebamp';
import useWebamp from 'components/apps/Webamp/useWebamp';
import type { ComponentProcessProps } from 'components/system/Apps/RenderComponent';
import useWindowTransitions from 'components/system/Window/useWindowTransitions';
import { useFileSystem } from 'contexts/fileSystem';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useEffect, useRef } from 'react';
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
  const { foregroundId, prependToStack, setForegroundId, stackOrder } =
    useSession();
  const windowTransitions = useWindowTransitions(id, containerRef);
  const zIndex =
    stackOrder.length + (minimized ? 1 : -stackOrder.indexOf(id)) + 1;

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
    if (
      webampCI &&
      foregroundId === id &&
      !containerRef?.current?.contains(document.activeElement)
    ) {
      focusWindow(webampCI, 'main');
      containerRef?.current?.focus();
    }
  }, [foregroundId, id, webampCI]);

  return (
    <StyledWebamp
      ref={containerRef}
      tabIndex={-1}
      style={{ zIndex }}
      onFocus={() => {
        prependToStack(id);
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
