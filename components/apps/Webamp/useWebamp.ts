import { basename } from "path";
import { type Options, type Track, type URLTrack } from "webamp";
import { useCallback, useEffect, useRef } from "react";
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
import { type SkinData, type WebampCI } from "components/apps/Webamp/types";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import {
  AUDIO_PLAYLIST_EXTENSIONS,
  DESKTOP_PATH,
  HIGH_PRIORITY_REQUEST,
  MILLISECONDS_IN_SECOND,
  SAVE_PATH,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { getExtension, haltEvent } from "utils/functions";
import { useSnapshots } from "hooks/useSnapshots";

type Webamp = {
  initWebamp: (containerElement: HTMLDivElement, options: Options) => void;
  webampCI?: WebampCI;
};

const SKIN_DATA_PATH = `${SAVE_PATH}/webampSkinData.json`;
const SKIN_DATA_NAME = "webampSkinData.json";

const useWebamp = (id: string): Webamp => {
  const { onClose, onMinimize } = useWindowActions(id);
  const { setWindowStates, windowStates: { [id]: windowState } = {} } =
    useSession();
  const { position } = windowState || {};
  const {
    argument,
    linkElement,
    processes: { [id]: process },
    title,
  } = useProcesses();
  const { closing, componentWindow } = process || {};
  const webampCI = useRef<WebampCI>(undefined);
  const { createPath, deletePath, exists, readFile, updateFolder } =
    useFileSystem();
  const { onDrop } = useFileDrop({ id });
  const metadataProviderRef = useRef(0);
  const windowPositionDebounceRef = useRef(0);
  const subscriptions = useRef<(() => void)[]>([]);
  const { createSnapshot } = useSnapshots();
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

          if (process) {
            if (!componentWindow) {
              linkElement(id, "componentWindow", containerElement);
            }

            if (mainWindow) {
              linkElement(id, "peekElement", mainWindow);
            }

            argument(id, "play", () => webamp.play());
            argument(id, "pause", () => webamp.pause());
            webamp._actionEmitter.on("PLAY", () =>
              argument(id, "paused", false)
            );
            webamp._actionEmitter.on("PAUSE", () =>
              argument(id, "paused", true)
            );
            webamp._actionEmitter.on("STOP", () =>
              argument(id, "paused", true)
            );
            webamp._actionEmitter.on("IS_STOPPED", () =>
              argument(id, "paused", true)
            );
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
                  playlist: { currentTrack } = {},
                  tracks,
                } = webamp.store.getState() || {};

                if (closed) {
                  window.clearInterval(metadataProviderRef.current);
                } else if (
                  typeof currentTrack === "number" &&
                  tracks[currentTrack]
                ) {
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
              const { playlist: { currentTrack } = {}, tracks } =
                webamp.store.getState() || {};
              const { artist = "", title: trackTitle = "" } =
                typeof currentTrack === "number"
                  ? tracks?.[currentTrack] || {}
                  : {};

              if (trackTitle || artist) {
                title(
                  id,
                  trackTitle && artist
                    ? `${artist} - ${trackTitle}`
                    : trackTitle || artist
                );
              }
            }
          } else {
            title(id, processDirectory.Webamp.title);
          }
        }),
        webamp._actionEmitter.on("SET_SKIN_DATA", ({ data }) =>
          createSnapshot(
            SKIN_DATA_NAME,
            Buffer.from(JSON.stringify(data)),
            async () => {
              const { skinUrl } =
                (webamp.options.availableSkins as { skinUrl?: string }[])?.find(
                  (skin) => skin.skinUrl
                ) || {};

              return skinUrl
                ? Buffer.from(
                    await (
                      await fetch(
                        `https://r2.webampskins.org/screenshots/${basename(skinUrl, ".wsz")}.png`
                      )
                    ).arrayBuffer()
                  )
                : undefined;
            }
          )
        ),
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
      argument,
      componentWindow,
      createPath,
      createSnapshot,
      deletePath,
      exists,
      id,
      linkElement,
      onDrop,
      onMinimize,
      onWillClose,
      position,
      process,
      readFile,
      setWindowStates,
      title,
      updateFolder,
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
