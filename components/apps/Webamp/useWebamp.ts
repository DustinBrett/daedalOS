import {
  BASE_WEBAMP_OPTIONS,
  cleanBufferOnSkinLoad,
  closeEqualizer,
  enabledMilkdrop,
  getWebampElement,
  loadButterchurnPreset,
  loadMilkdropWhenNeeded,
  MAIN_WINDOW,
  parseTrack,
  PLAYLIST_WINDOW,
  tracksFromPlaylist,
  updateWebampPosition,
} from "components/apps/Webamp/functions";
import type { WebampCI } from "components/apps/Webamp/types";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import type { CompleteAction } from "components/system/Files/FileManager/useFolder";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { extname } from "path";
import { useCallback, useRef } from "react";
import { useTheme } from "styled-components";
import {
  AUDIO_PLAYLIST_EXTENSIONS,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { haltEvent } from "utils/functions";
import type { Options, Track } from "webamp";

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
  const webampCI = useRef<WebampCI>();
  const { readFile } = useFileSystem();
  const { onDrop: onDropCopy } = useFileDrop({ id });
  const { onDrop } = useFileDrop({
    callback: async (
      fileName: string,
      buffer?: Buffer,
      completeAction?: CompleteAction
    ) => {
      if (webampCI.current) {
        const data = buffer || (await readFile(fileName));
        const track = await parseTrack(data, fileName);

        if (completeAction !== "updateUrl") {
          webampCI.current.appendTracks([track]);
        }
      }
    },
    id,
  });
  const initWebamp = useCallback(
    (
      containerElement: HTMLDivElement,
      { initialSkin, initialTracks }: Options
    ) => {
      const handleUrl = async (): Promise<Track[]> => {
        // eslint-disable-next-line no-alert
        const externalUrl = prompt(
          "Enter an Internet location to open here:\nFor example: https://server.com/playlist.m3u"
        );

        if (externalUrl) {
          const playlistExtension = extname(externalUrl).toLowerCase();

          if (AUDIO_PLAYLIST_EXTENSIONS.has(playlistExtension)) {
            return tracksFromPlaylist(
              await (await fetch(externalUrl)).text(),
              playlistExtension
            );
          }

          return [
            {
              duration: 0,
              url: externalUrl,
            },
          ];
        }

        return [];
      };
      const webamp = new window.Webamp({
        ...BASE_WEBAMP_OPTIONS,
        handleAddUrlEvent: handleUrl,
        handleLoadListEvent: handleUrl,
        initialSkin,
        initialTracks,
      } as Options) as WebampCI;
      const setupElements = (): void => {
        const webampElement = getWebampElement();

        if (webampElement) {
          const mainWindow =
            webampElement.querySelector<HTMLDivElement>(MAIN_WINDOW);
          const playlistWindow =
            webampElement.querySelector<HTMLDivElement>(PLAYLIST_WINDOW);

          [mainWindow, playlistWindow].forEach((element) => {
            element?.addEventListener("drop", (event) => {
              onDropCopy(event);
              onDrop(event);
            });
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
        webamp.onTrackDidChange(() => {
          const { milkdrop, windows } = webamp.store.getState();

          if (windows?.genWindows?.milkdrop?.open && milkdrop?.butterchurn) {
            loadButterchurnPreset(webamp);
          }
        }),
      ];

      if (initialSkin) cleanBufferOnSkinLoad(webamp, initialSkin.url);

      webamp.renderWhenReady(containerElement).then(() => {
        closeEqualizer(webamp);
        enabledMilkdrop(webamp);
        loadMilkdropWhenNeeded(webamp);
        updateWebampPosition(webamp, taskbarHeight, position);
        setupElements();

        if (initialTracks) webamp.play();
      });

      webampCI.current = webamp;
    },
    [
      componentWindow,
      id,
      linkElement,
      onClose,
      onDrop,
      onDropCopy,
      onMinimize,
      position,
      process,
      setWindowStates,
      taskbarHeight,
    ]
  );

  return {
    initWebamp,
    webampCI: webampCI.current,
  };
};

export default useWebamp;
