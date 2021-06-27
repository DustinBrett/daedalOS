import {
  closeEqualizer,
  getWebampElement,
  parseTrack,
  updateWebampPosition
} from 'components/apps/Webamp/functions';
import type { WebampCI, WebampOptions } from 'components/apps/Webamp/types';
import useWindowActions from 'components/system/Window/Titlebar/useWindowActions';
import { useProcesses } from 'contexts/process';
import type { Process } from 'contexts/process/types';
import { useSession } from 'contexts/session';
import { basename } from 'path';
import { useState } from 'react';
import { useTheme } from 'styled-components';
import { WINDOW_TRANSITION_DURATION_IN_MILLISECONDS } from 'utils/constants';

type Webamp = {
  loadWebamp: (
    containerElement: HTMLDivElement | null,
    url: string,
    file?: Buffer
  ) => void;
  webampCI: WebampCI | null;
};

const useWebamp = (id: string): Webamp => {
  const { onClose, onMinimize } = useWindowActions(id);
  const {
    setWindowStates,
    windowStates: { [id]: { position = undefined } = {} } = {}
  } = useSession();
  const {
    sizes: {
      taskbar: { height: taskbarHeight }
    }
  } = useTheme();
  const {
    linkElement,
    processes: { [id]: windowProcess = {} }
  } = useProcesses();
  const { componentWindow } = windowProcess as Process;
  const [webampCI, setWebampCI] = useState<WebampCI | null>(null);
  const loadWebamp = (
    containerElement: HTMLDivElement | null,
    url: string,
    file?: Buffer
  ): void => {
    if (containerElement && window.Webamp && !webampCI) {
      const runWebamp = (options?: WebampOptions) => {
        const webamp: WebampCI = new window.Webamp(options);
        const setupElements = () => {
          const webampElement = getWebampElement();
          const [main] = webampElement.getElementsByClassName('window');

          if (!componentWindow && main && Object.keys(windowProcess).length) {
            linkElement(id, 'componentWindow', main as HTMLElement);
          }

          containerElement.appendChild(webampElement);
        };
        const subscriptions = [
          webamp.onWillClose((cancel) => {
            cancel();

            const [main] = getWebampElement().getElementsByClassName('window');
            const { x, y } = main.getBoundingClientRect();

            onClose();
            setWindowStates((currentWindowStates) => ({
              ...currentWindowStates,
              [id]: {
                position: { x, y }
              }
            }));

            setTimeout(() => {
              subscriptions.forEach((unsubscribe) => unsubscribe());
              webamp.close();
            }, WINDOW_TRANSITION_DURATION_IN_MILLISECONDS);
          }),
          webamp.onMinimize(() => onMinimize())
        ];

        webamp.renderWhenReady(containerElement).then(() => {
          closeEqualizer(webamp);
          updateWebampPosition(webamp, taskbarHeight, position);
          setupElements();
        });

        setWebampCI(webamp);
      };

      if (file) {
        parseTrack(file, basename(url)).then((track) =>
          runWebamp({ initialTracks: [track] })
        );
      } else {
        runWebamp();
      }
    }
  };

  return {
    loadWebamp,
    webampCI
  };
};

export default useWebamp;
