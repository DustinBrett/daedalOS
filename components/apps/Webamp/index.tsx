import {
  closeEqualizer,
  getWebampElement,
  updateWebampPosition
} from 'components/apps/Webamp/functions';
import type { WebampCI } from 'components/apps/Webamp/types';
import type { ComponentProcessProps } from 'components/system/Apps/RenderComponent';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useEffect, useRef } from 'react';
import { useTheme } from 'styled-components';
import { loadFiles } from 'utils/functions';

const Webamp = ({ id }: ComponentProcessProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    close,
    minimize,
    processes: { [id]: { minimized = false } = {} } = {}
  } = useProcesses();
  const {
    setWindowStates,
    windowStates: { [id]: { position = undefined } = {} } = {}
  } = useSession();
  const {
    sizes: {
      taskbar: { height: taskbarHeight }
    }
  } = useTheme();

  useEffect(() => {
    loadFiles(['/libs/webamp/webamp.bundle.min.js']).then(() => {
      if (containerRef?.current) {
        const webamp: WebampCI = new window.Webamp({ zIndex: 1 });

        webamp.onClose(() => {
          const [main] = getWebampElement().getElementsByClassName('window');
          const { x, y } = main.getBoundingClientRect();

          close(id);
          setWindowStates((currentWindowStates) => ({
            ...currentWindowStates,
            [id]: {
              position: { x, y }
            }
          }));
        });
        webamp.onMinimize(() => minimize(id));
        webamp
          .renderWhenReady(containerRef?.current as HTMLDivElement)
          .then(() => {
            closeEqualizer(webamp);
            updateWebampPosition(webamp, taskbarHeight, position);
            containerRef?.current?.appendChild(getWebampElement());
          });
      }
    });
  }, [
    close,
    containerRef,
    id,
    minimize,
    position,
    setWindowStates,
    taskbarHeight
  ]);

  useEffect(() => {
    const webamp = getWebampElement();

    if (webamp) {
      webamp.style.display = minimized ? 'none' : 'block';
    }
  }, [minimized]);

  return <div ref={containerRef} />;
};

export default Webamp;
