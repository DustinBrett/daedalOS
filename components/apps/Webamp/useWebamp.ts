import {
  BASE_WEBAMP_OPTIONS,
  MAIN_WINDOW,
  PLAYLIST_WINDOW,
  cleanBufferOnSkinLoad,
  closeEqualizer,
  createM3uPlaylist,
  enabledMilkdrop,
  getMetadataProvider,
  getWebampElement,
  loadButterchurnPreset,
  loadMilkdropWhenNeeded,
  setSkinData,
  tracksFromPlaylist,
  updateWebampPosition,
} from "components/apps/Webamp/functions";
import type { SkinData, WebampCI } from "components/apps/Webamp/types";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { basename, dirname } from "path";
import { useCallback, useEffect, useRef } from "react";
import {
  AUDIO_PLAYLIST_EXTENSIONS,
  DESKTOP_PATH,
  HIGH_PRIORITY_REQUEST,
  MILLISECONDS_IN_SECOND,
  SAVE_PATH,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { getExtension, haltEvent } from "utils/functions";
import type { Options, Track, URLTrack } from "webamp";

type Webamp = {
  initWebamp: (containerElement: HTMLDivElement, options: Options) => void;
  webampCI?: WebampCI;
};

const SKIN_DATA_PATH = `${SAVE_PATH}/webampSkinData.json`;

const useWebamp = (id: string): Webamp => {
  const { onClose, onMinimize } = useWindowActions(id);
  const { setWindowStates, windowStates: { [id]: windowState } = {} } =
    useSession();
  const { position } = windowState || {};
  const {
    linkElement,
    processes: { [id]: process },
    title,
  } = useProcesses();
  const { closing, componentWindow } = process || {};
  const webampCI = useRef<WebampCI>();
  const {
    createPath,
    deletePath,
    exists,
    readFile,
    mkdirRecursive,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const { onDrop } = useFileDrop({ id });
  const metadataProviderRef = useRef<number>();
  const windowPositionDebounceRef = useRef<number>();
  const subscriptions = useRef<(() => void)[]>([]);
  const onWillClose = useCallback(
    (cancel?: () => void): void => {
      cancel?.();
      onClose();

      window.setTimeout(() => {
        subscriptions.current.forEach((unsubscribe) => unsubscribe());
        webampCI.current?.close();
      }, TRANSITIONS_IN_MILLISECONDS.WINDOW);
      window.clearInterval(metadataProviderRef.current);
      window.clearInterval(windowPositionDebounceRef.current);
    },
    [onClose]
  );
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
          const playlistExtension = getExtension(externalUrl);

          if (AUDIO_PLAYLIST_EXTENSIONS.has(playlistExtension)) {
            return tracksFromPlaylist(
              await (await fetch(externalUrl, HIGH_PRIORITY_REQUEST)).text(),
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
        handleSaveListEvent: (tracks: URLTrack[]) => {
          createPath(
            "playlist.m3u",
            DESKTOP_PATH,
            Buffer.from(createM3uPlaylist(tracks))
          ).then((saveName) => updateFolder(DESKTOP_PATH, saveName));
        },
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
            element?.addEventListener("drop", onDrop);
            element?.addEventListener("dragover", haltEvent);
          });

          if (process && !componentWindow && mainWindow) {
            linkElement(id, "componentWindow", containerElement);
            linkElement(id, "peekElement", mainWindow);
          }

          if (!initialSkin && !process.url?.endsWith(".wsz")) {
            exists(SKIN_DATA_PATH).then(async (skinExists) => {
              if (skinExists) {
                setSkinData(
                  webamp,
                  JSON.parse(
                    (await readFile(SKIN_DATA_PATH)).toString()
                  ) as SkinData
                );
              }
            });
          }

          containerElement.append(webampElement);
        }
      };
      const updatePosition = (): void => {
        window.clearInterval(windowPositionDebounceRef.current);
        windowPositionDebounceRef.current = window.setTimeout(() => {
          const mainWindow =
            getWebampElement()?.querySelector<HTMLDivElement>(MAIN_WINDOW);
          const { x = 0, y = 0 } = mainWindow?.getBoundingClientRect() || {};

          setWindowStates((currentWindowStates) => ({
            ...currentWindowStates,
            [id]: {
              position: { x, y },
            },
          }));
        }, TRANSITIONS_IN_MILLISECONDS.WINDOW);
      };

      subscriptions.current.push(
        webamp.onWillClose(onWillClose),
        webamp.onMinimize(() => onMinimize()),
        webamp.onTrackDidChange((track) => {
          const { milkdrop, windows } = webamp.store.getState();

          if (windows?.genWindows?.milkdrop?.open && milkdrop?.butterchurn) {
            loadButterchurnPreset(webamp);
          }

          window.clearInterval(metadataProviderRef.current);

          if (track?.url) {
            const getMetadata = getMetadataProvider(track.url);

            if (getMetadata) {
              const updateTrackInfo = async (): Promise<void> => {
                const {
                  display: { closed = false } = {},
                  playlist: { currentTrack = -1 } = {},
                  tracks,
                } = webamp.store.getState() || {};

                if (closed) {
                  window.clearInterval(metadataProviderRef.current);
                } else if (tracks[currentTrack]) {
                  const metaData = await getMetadata?.();

                  if (metaData) {
                    webamp.store.dispatch({
                      type: "SET_MEDIA_TAGS",
                      ...tracks[currentTrack],
                      ...metaData,
                    });
                    title(id, `${metaData.artist} - ${metaData.title}`);
                  }
                }
              };

              updateTrackInfo();
              metadataProviderRef.current = window.setInterval(
                updateTrackInfo,
                30 * MILLISECONDS_IN_SECOND
              );
            } else {
              const { playlist: { currentTrack = -1 } = {}, tracks } =
                webamp.store.getState() || {};

              if (tracks[currentTrack]) {
                const { artist, title: trackTitle } = tracks[currentTrack];
                let newTitle = "";

                if (trackTitle && artist) {
                  newTitle = `${artist} - ${trackTitle}`;
                } else if (trackTitle || artist) {
                  newTitle = trackTitle || artist;
                }

                if (newTitle) title(id, newTitle);
              }
            }
          } else {
            title(id, processDirectory.Webamp.title);
          }
        }),
        webamp._actionEmitter.on("SET_SKIN_DATA", async ({ data }) => {
          if (!(await exists(SAVE_PATH))) {
            await mkdirRecursive(SAVE_PATH);
            updateFolder(dirname(SAVE_PATH));
          }

          writeFile(SKIN_DATA_PATH, JSON.stringify(data), true);
          updateFolder(SAVE_PATH, basename(SKIN_DATA_PATH));
        }),
        webamp._actionEmitter.on("LOAD_DEFAULT_SKIN", () => {
          deletePath(SKIN_DATA_PATH);
        }),
        webamp._actionEmitter.on("UPDATE_WINDOW_POSITIONS", updatePosition)
      );

      if (initialSkin) cleanBufferOnSkinLoad(webamp, initialSkin.url);

      webamp.renderWhenReady(containerElement).then(() => {
        closeEqualizer(webamp);
        enabledMilkdrop(webamp);
        loadMilkdropWhenNeeded(webamp);
        updateWebampPosition(webamp, position);
        setupElements();

        if (initialTracks) webamp.play();
      });

      window.WebampGlobal = webamp;
      webampCI.current = webamp;
    },
    [
      componentWindow,
      createPath,
      deletePath,
      exists,
      id,
      linkElement,
      mkdirRecursive,
      onDrop,
      onMinimize,
      onWillClose,
      position,
      process,
      readFile,
      setWindowStates,
      title,
      updateFolder,
      writeFile,
    ]
  );

  useEffect(() => {
    if (closing) onWillClose();
  }, [closing, onWillClose]);

  return {
    initWebamp,
    webampCI: webampCI.current,
  };
};

export default useWebamp;
