import {
  closeEqualizer,
  getWebampElement,
  updateWebampPosition
} from 'components/apps/Webamp/functions';
import type { WebampCI, WebampOptions } from 'components/apps/Webamp/types';
import useWindowActions from 'components/system/Window/Titlebar/useWindowActions';
import { useSession } from 'contexts/session';
import { useState } from 'react';
import { useTheme } from 'styled-components';
import { bufferToUrl, cleanUpBufferUrl } from 'utils/functions';

type Webamp = {
  loadWebamp: (containerElement: HTMLDivElement | null, file?: Buffer) => void;
  webampCI: WebampCI | null;
};

const useWebamp = (id: string): Webamp => {
  const { onClose, onMinimize } = useWindowActions(id);
  const {
    setWindowStates,
    stackOrder,
    windowStates: { [id]: { position = undefined } = {} } = {}
  } = useSession();
  const {
    sizes: {
      taskbar: { height: taskbarHeight }
    }
  } = useTheme();
  const [webampCI, setWebampCI] = useState<WebampCI | null>(null);
  const loadWebamp = (
    containerElement: HTMLDivElement | null,
    file?: Buffer
  ): void => {
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

      webamp.onWillClose(() => {
        const [main] = getWebampElement().getElementsByClassName('window');
        const { x, y } = main.getBoundingClientRect();

        onClose();
        setWindowStates((currentWindowStates) => ({
          ...currentWindowStates,
          [id]: {
            position: { x, y }
          }
        }));

        if (options.initialTracks) {
          const [{ url: objectUrl }] = options.initialTracks;

          cleanUpBufferUrl(objectUrl);
        }
      });
      webamp.onMinimize(() => onMinimize());
      webamp.renderWhenReady(containerElement).then(() => {
        closeEqualizer(webamp);
        updateWebampPosition(webamp, taskbarHeight, position);
        containerElement.appendChild(getWebampElement());
      });

      setWebampCI(webamp);
    }
  };

  return {
    loadWebamp,
    webampCI
  };
};

export default useWebamp;
