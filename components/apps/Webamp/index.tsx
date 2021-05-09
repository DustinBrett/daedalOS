import {
  closeEqualizer,
  updateWindowPositions
} from 'components/apps/Webamp/functions';
import type { WebampCI } from 'components/apps/Webamp/types';
import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import { centerPosition } from 'components/system/Window/functions';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useEffect, useRef } from 'react';
import { useTheme } from 'styled-components';
import { loadFiles } from 'utils/functions';

const getWebampElement = (): HTMLDivElement =>
  document.getElementById('webamp') as HTMLDivElement;

const Webamp = ({ id }: ProcessComponentProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    close,
    minimize,
    processes: { [id]: { minimized = false } = {} } = {}
  } = useProcesses();
  const {
    setWindowStates,
    windowStates: { [id]: windowState } = {}
  } = useSession();
  const { position: { x: previousX = -1, y: previousY = -1 } = {} } =
    windowState || {};
  const {
    sizes: {
      taskbar: { height: taskbarHeight }
    }
  } = useTheme();

  useEffect(() => {
    if (containerRef?.current) {
      loadFiles(['/libs/webamp/webamp.bundle.min.js']).then(() => {
        const webamp: WebampCI = new window.Webamp({ zIndex: 2 });

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
            if (previousX === -1) {
              const webampSize = [
                ...getWebampElement().getElementsByClassName('window')
              ].reduce(
                (acc, element) => {
                  const { height, width } = element.getBoundingClientRect();

                  return {
                    height: acc.height + height,
                    width
                  };
                },
                { height: 0, width: 0 }
              );
              const { x: centerX, y: centerY } = centerPosition(
                webampSize,
                taskbarHeight
              );

              updateWindowPositions(webamp, centerX, centerY);
            } else {
              updateWindowPositions(webamp, previousX, previousY);
            }

            containerRef?.current?.appendChild(getWebampElement());
          });
      });
    }
  }, [
    close,
    containerRef,
    id,
    minimize,
    previousX,
    previousY,
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
