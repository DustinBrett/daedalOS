import { type Track, type URLTrack } from "webamp";
import { type Position } from "react-rnd";
import {
  type ButterChurnPresets,
  type ButterChurnWebampPreset,
  type SkinData,
  type WebampApiResponse,
  type WebampCI,
} from "components/apps/Webamp/types";
import { centerPosition } from "components/system/Window/functions";
import { HOME, MP3_MIME_TYPE, PACKAGE_DATA } from "utils/constants";
import { bufferToBlob, cleanUpBufferUrl, loadFiles } from "utils/functions";

const BROKEN_PRESETS = new Set([
  "Flexi - alien fish pond",
  "Geiss - Spiral Artifact",
]);

const WEBAMP_SKINS_PATH = `${HOME}/Documents/Winamp Skins`;

const ALLOWS_CORS_IN_WINAMP_SKIN_MUSEUM =
  typeof window !== "undefined" &&
  ["localhost", PACKAGE_DATA.author.url.replace("https://", "")].includes(
    window.location.hostname
  );

const createWebampSkinMuseumQuery = (offset: number): string => `
  query {
    skins(filter: APPROVED, first: 1, offset: ${offset}) {
      nodes {
        download_url
      }
    }
  }
`;

export const BASE_WEBAMP_OPTIONS = {
  availableSkins: [
    {
      name: "Aqua X",
      url: `${WEBAMP_SKINS_PATH}/Aqua_X.wsz`,
    },
    {
      name: "Nucleo NLog v2G",
      url: `${WEBAMP_SKINS_PATH}/Nucleo_NLog_v102.wsz`,
    },
    ...(ALLOWS_CORS_IN_WINAMP_SKIN_MUSEUM
      ? [
          {
            defaultName: "Random (Winamp Skin Museum)",
            loading: false,
            get name(): string {
              if (this.loading) return this.defaultName;

              this.loading = true;

              fetch("https://api.webamp.org/graphql", {
                body: JSON.stringify({
                  query: createWebampSkinMuseumQuery(
                    Math.floor(Math.random() * 1000)
                  ),
                }),
                headers: {
                  "Content-Type": "application/json",
                },
                method: "POST",
              }).then(async (response) => {
                const { data } = ((await response.json()) ||
                  {}) as WebampApiResponse;

                this.skinUrl = data?.skins?.nodes?.[0]?.download_url as string;
                this.loading = false;
              });

              return this.defaultName;
            },
            skinUrl: "",
            get url(): string {
              return this.skinUrl || `${WEBAMP_SKINS_PATH}/base-2.91.wsz`;
            },
          },
        ]
      : []),
    {
      name: "SpyAMP Professional Edition v5",
      url: `${WEBAMP_SKINS_PATH}/SpyAMP_Professional_Edition_v5.wsz`,
    },
  ],
};

const BASE_WINDOW_SIZE = {
  height: 116,
  width: 275,
};

const CONTAINER_WINDOW = "#webamp";

export const MAIN_WINDOW = "#main-window";

export const PLAYLIST_WINDOW = "#playlist-window";

export const cleanBufferOnSkinLoad = (
  webamp: WebampCI,
  url = ""
): Promise<void> =>
  webamp.skinIsLoaded().then(() => {
    if (url) cleanUpBufferUrl(url);
  });

export const closeEqualizer = (webamp: WebampCI): void => {
  webamp.store.dispatch({
    type: "CLOSE_WINDOW",
    windowId: "equalizer",
  });
};

export const enabledMilkdrop = (webamp: WebampCI): void => {
  webamp.store.dispatch({
    open: false,
    type: "ENABLE_MILKDROP",
  });
};

export const setSkinData = (webamp: WebampCI, data: SkinData): void => {
  webamp.store.dispatch({
    data,
    type: "SET_SKIN_DATA",
  });
};

const loadButterchurn = (webamp: WebampCI, butterchurn: unknown): void => {
  webamp.store.dispatch({
    butterchurn,
    type: "GOT_BUTTERCHURN",
  });
};

const loadButterchurnPresets = (
  webamp: WebampCI,
  presets: ButterChurnWebampPreset[]
): void =>
  webamp.store.dispatch({
    presets,
    type: "GOT_BUTTERCHURN_PRESETS",
  });

const getButterchurnPresetIndex = (webamp: WebampCI): number => {
  const { presetHistory = [], presets = [] } =
    webamp.store.getState()?.milkdrop || {};
  const index = Math.floor(Math.random() * presets.length);
  const preset = presets[index];

  return preset.name &&
    !BROKEN_PRESETS.has(preset.name) &&
    !presetHistory.slice(-5).includes(index)
    ? index
    : getButterchurnPresetIndex(webamp);
};

export const loadButterchurnPreset = (webamp: WebampCI): void => {
  const index = getButterchurnPresetIndex(webamp);

  webamp.store.dispatch({
    addToHistory: true,
    index,
    type: "PRESET_REQUESTED",
  });
  webamp.store.dispatch({
    index,
    type: "SELECT_PRESET_AT_INDEX",
  });
};

let cycleTimerId = 0;

const cycleButterchurnPresets = (webamp: WebampCI): void => {
  window.clearInterval(cycleTimerId);
  cycleTimerId = window.setInterval(() => {
    if (!webamp) window.clearInterval(cycleTimerId);

    loadButterchurnPreset(webamp);
  }, 20000);
};

export const loadMilkdropWhenNeeded = (webamp: WebampCI): void => {
  const unsubscribe = webamp.store.subscribe(() => {
    const { milkdrop, windows } = webamp.store.getState();

    if (windows?.genWindows?.milkdrop?.open && !milkdrop?.butterchurn) {
      loadFiles(["/Program Files/Webamp/butterchurn.min.js"]).then(() => {
        if (!window.butterchurn?.default) return;

        loadButterchurn(webamp, window.butterchurn.default);

        const { playlist, main: mainWindow } = windows.genWindows || {};
        const { x = 0, y = 0 } =
          (playlist?.open ? playlist?.position : mainWindow?.position) || {};

        webamp.store.dispatch({
          positions: {
            milkdrop: {
              x,
              y: y + BASE_WINDOW_SIZE.height,
            },
          },
          type: "UPDATE_WINDOW_POSITIONS",
        });

        unsubscribe();

        webamp.store.subscribe(() => {
          const webampDesktop = [...document.body.children].find((node) =>
            node.classList?.contains("webamp-desktop")
          );

          if (webampDesktop) {
            const main = document.querySelector("main");

            if (main) {
              [...main.children].forEach((node) => {
                if (node.classList?.contains("webamp-desktop")) {
                  node.remove();
                }
              });
              main.append(webampDesktop);
            }
          }
        });

        import("butterchurn-presets").then(({ default: presets }) => {
          const resolvedPresets: ButterChurnWebampPreset[] = Object.entries(
            presets as ButterChurnPresets
          ).map(([name, preset]) => ({
            name,
            preset,
          }));

          loadButterchurnPresets(webamp, resolvedPresets);
          loadButterchurnPreset(webamp);
          cycleButterchurnPresets(webamp);
        });
      });
    }
  });
};

export const getWebampElement = (): HTMLDivElement | null =>
  document.querySelector<HTMLDivElement>(CONTAINER_WINDOW);

export const updateWebampPosition = (
  webamp: WebampCI,
  position?: Position
): void => {
  const { height, width } = BASE_WINDOW_SIZE;
  const { x, y } = position || centerPosition({ height: height * 2, width });

  webamp.store.dispatch({
    positions: {
      main: { x, y },
      milkdrop: { x: 0 - width, y: 0 - height },
      playlist: { x, y: height + y },
    },
    type: "UPDATE_WINDOW_POSITIONS",
  });
};

export const focusWindow = (webamp: WebampCI, window: string): void =>
  webamp.store.dispatch({
    type: "SET_FOCUSED_WINDOW",
    window,
  });

export const unFocus = (webamp: WebampCI): void =>
  webamp.store.dispatch({
    type: "SET_FOCUSED_WINDOW",
    window: "",
  });

export const parseTrack = async (
  file: Buffer,
  fileName: string
): Promise<Track> => {
  const { parseBuffer } = await import("music-metadata-browser");
  const {
    common: { album = "", artist = "", title = fileName },
    format: { duration = 0 },
  } = await parseBuffer(
    file,
    {
      mimeType: MP3_MIME_TYPE,
      size: file.length,
    },
    { duration: true, skipCovers: true, skipPostHeaders: true }
  );

  return {
    blob: bufferToBlob(file, "audio/mpeg"),
    duration: Math.floor(duration),
    metaData: { album, artist, title },
  };
};

export const createM3uPlaylist = (tracks: URLTrack[]): string => {
  const m3uPlaylist = tracks.map((track): string => {
    const trackUrl = track.url ? `\n${track.url}` : "";
    let title = track.defaultName;

    if (track.metaData?.artist) {
      if (track.metaData?.title) {
        title = `${track.metaData.artist} - ${track.metaData.title}`;
      } else if (title) {
        title = `${track.metaData.artist} - ${title}`;
      }
    } else if (track.metaData?.title) {
      title = track.metaData.title;
    }

    return trackUrl
      ? `#EXTINF:${track.duration ?? -1},${title || ""}${trackUrl}`
      : "";
  });

  return `${["#EXTM3U", ...m3uPlaylist.filter(Boolean)].join("\n")}\n`;
};

const MAX_PLAYLIST_ITEMS = 1000;

export const tracksFromPlaylist = async (
  data: string,
  extension: string,
  defaultName?: string
): Promise<Track[]> => {
  const { ASX, M3U, PLS } = await import("playlist-parser");
  // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
  const parser: Record<string, typeof ASX | typeof M3U | typeof PLS> = {
    ".asx": ASX,
    ".m3u": M3U,
    ".pls": PLS,
  };
  const tracks =
    parser[extension]
      ?.parse(data)
      .filter(Boolean)
      .slice(0, MAX_PLAYLIST_ITEMS) ?? [];

  return tracks.map(({ artist = "", file = "", length = 0, title = "" }) => {
    const [parsedArtist, parsedTitle] = [artist.trim(), title.trim()];

    return {
      duration: Math.max(length, 0),
      metaData: {
        album: parsedTitle || defaultName,
        artist: parsedArtist,
        title: parsedTitle,
      },
      url: file,
    };
  });
};

type MetadataGetter = () => Promise<Track["metaData"]>;

type MetadataProvider = (url: string) => MetadataGetter;

const removeCData = (string = ""): string =>
  string.replace(/<!\[CDATA\[|\]\]>/g, "");

const streamingMetadataProviders: Record<string, MetadataProvider> = {
  "somafm.com": (url: string) => async () => {
    const { pathname } = new URL(url);
    const [channel] = pathname.replace("/", "").split("-");
    const xmlPlaylist = await (
      await fetch(`https://somafm.com/songs/${channel}.xml`, {
        cache: "no-cache",
        credentials: "omit",
        keepalive: false,
        mode: "cors",
        referrerPolicy: "no-referrer",
        // eslint-disable-next-line unicorn/no-null
        window: null,
      })
    ).text();
    const songNode = new DOMParser()
      .parseFromString(xmlPlaylist, "application/xml")
      .querySelector("song");
    const artist = songNode?.querySelector("artist")?.innerHTML;
    const title = songNode?.querySelector("title")?.innerHTML;

    return {
      artist: removeCData(artist),
      title: removeCData(title),
    };
  },
};

export const getMetadataProvider = (url: string): MetadataGetter | void => {
  const { host } = new URL(url);
  const [, domain, tld] = host.split(".");

  return streamingMetadataProviders[`${domain}.${tld}`]?.(url);
};
