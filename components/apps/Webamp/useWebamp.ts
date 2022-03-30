import {
  BASE_WEBAMP_OPTIONS,
  cleanBufferOnSkinLoad,
  closeEqualizer,
  getWebampElement,
  MAIN_WINDOW,
  PLAYLIST_WINDOW,
  updateWebampPosition,
} from "components/apps/Webamp/functions";
import type { WebampCI } from "components/apps/Webamp/types";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useCallback, useState } from "react";
import { useTheme } from "styled-components";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { haltEvent } from "utils/functions";
import type { Options } from "webamp";

type Webamp = {
  initWebamp: (containerElement: HTMLDivElement, options: Options) => void;
  webampCI?: WebampCI;
};

const useWebamp = (id: string): Webamp => {
  const { onClose, onMinimize } = useWindowActions(id);
  const { setWindowStates, windowStates: { [id]: windowState } = {} } =
    useSession();
  const { position } = windowState || {};
  const {
    sizes: {
      taskbar: { height: taskbarHeight },
    },
  } = useTheme();
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { componentWindow } = process || {};
  const [webampCI, setWebampCI] = useState<WebampCI>();
  const { onDrop } = useFileDrop({ id });
  const initWebamp = useCallback(
    (
      containerElement: HTMLDivElement,
      { initialSkin, initialTracks }: Options
    ) => {
      const webamp = new window.Webamp({
        ...BASE_WEBAMP_OPTIONS,
        initialSkin,
        initialTracks,
      }) as WebampCI;
      const setupElements = (): void => {
        const webampElement = getWebampElement();

        if (webampElement) {
          const mainWindow =
            webampElement.querySelector<HTMLDivElement>(MAIN_WINDOW);
          const playlistWindow =
            webampElement.querySelector<HTMLDivElement>(PLAYLIST_WINDOW);

          [mainWindow, playlistWindow].forEach((element) => {
            element?.addEventListener("drop", onDrop);
            element?.addEventListener("dragover", haltEvent);
          });

          if (process && !componentWindow && mainWindow) {
            linkElement(id, "componentWindow", containerElement);
            linkElement(id, "peekElement", mainWindow);
          }

          containerElement.appendChild(webampElement);
        }
      };
      const subscriptions = [
        webamp.onWillClose((cancel) => {
          cancel();

          const mainWindow =
            getWebampElement()?.querySelector<HTMLDivElement>(MAIN_WINDOW);
          const { x = 0, y = 0 } = mainWindow?.getBoundingClientRect() || {};

          onClose();
          setWindowStates((currentWindowStates) => ({
            ...currentWindowStates,
            [id]: {
              position: { x, y },
            },
          }));

          window.setTimeout(() => {
            subscriptions.forEach((unsubscribe) => unsubscribe());
            webamp.close();
          }, TRANSITIONS_IN_MILLISECONDS.WINDOW);
        }),
        webamp.onMinimize(() => onMinimize()),
      ];

      if (initialSkin) cleanBufferOnSkinLoad(webamp, initialSkin.url);

      webamp.renderWhenReady(containerElement).then(() => {
        closeEqualizer(webamp);
        updateWebampPosition(webamp, taskbarHeight, position);
        setupElements();

        if (initialTracks) webamp.play();
      });

      setWebampCI(webamp);
    },
    [
      componentWindow,
      id,
      linkElement,
      onClose,
      onDrop,
      onMinimize,
      position,
      process,
      setWindowStates,
      taskbarHeight,
    ]
  );

  return {
    initWebamp,
    webampCI,
  };
};

export default useWebamp;
