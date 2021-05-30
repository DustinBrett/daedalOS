import {
  closeEqualizer,
  getWebampElement,
  updateWebampPosition
} from 'components/apps/Webamp/functions';
import type { WebampCI, WebampOptions } from 'components/apps/Webamp/types';
import { closeWithTransition } from 'components/system/Window/functions';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useCallback, useState } from 'react';
import { useTheme } from 'styled-components';
import { bufferToUrl, cleanUpBufferUrl } from 'utils/functions';

type Webamp = {
  loadWebamp: (containerElement: HTMLDivElement | null, file?: Buffer) => void;
  webampCI: WebampCI | null;
};

const useWebamp = (id: string): Webamp => {
  const { close, minimize } = useProcesses();
  const {
    setWindowStates,
    setStackOrder,
    stackOrder,
    windowStates: { [id]: { position = undefined } = {} } = {}
  } = useSession();
  const {
    sizes: {
      taskbar: { height: taskbarHeight }
    }
  } = useTheme();
  const [webampCI, setWebampCI] = useState<WebampCI | null>(null);
  const loadWebamp = useCallback(
    (containerElement: HTMLDivElement | null, file?: Buffer): void => {
      if (containerElement && window.Webamp && !webampCI) {
        const options: WebampOptions = {
          __butterchurnOptions: {
            importButterchurn: () => Promise.resolve(window.butterchurn),
            getPresets: () => {
              const presets = window.butterchurnPresets.getPresets();

              return Object.keys(presets).map((name) => {
                return {
                  name,
                  butterchurnPresetObject: presets[name]
                };
              });
            },
            butterchurnOpen: true
          },
          zIndex: stackOrder.length + 1
        };

        if (file) {
          options.initialTracks = [
            {
              metaData: {
                artist: '',
                title: ''
              },
              url: bufferToUrl(file)
            }
          ];
        }

        const webamp: WebampCI = new window.Webamp(options);

        webamp.onWillClose((cancel) => {
          cancel();

          const [main] = getWebampElement().getElementsByClassName('window');
          const { x, y } = main.getBoundingClientRect();

          closeWithTransition(close, id);
          setWindowStates((currentWindowStates) => ({
            ...currentWindowStates,
            [id]: {
              position: { x, y }
            }
          }));
          setStackOrder((currentStackOrder) =>
            currentStackOrder.filter((stackId) => stackId !== id)
          );

          if (options.initialTracks) {
            const [{ url: objectUrl }] = options.initialTracks;

            cleanUpBufferUrl(objectUrl);
          }
        });
        webamp.onMinimize(() => minimize(id));
        webamp.renderWhenReady(containerElement).then(() => {
          closeEqualizer(webamp);
          updateWebampPosition(webamp, taskbarHeight, position);
          containerElement.appendChild(getWebampElement());
        });

        setWebampCI(webamp);
      }
    },
    [
      close,
      id,
      minimize,
      position,
      setStackOrder,
      setWindowStates,
      stackOrder.length,
      taskbarHeight,
      webampCI
    ]
  );

  return {
    loadWebamp,
    webampCI
  };
};

export default useWebamp;
