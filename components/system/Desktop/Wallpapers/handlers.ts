import { MAX_RETRIES } from "components/system/Desktop/Wallpapers/constants";
import {
  type ApodResponse,
  type ArtInstituteOfChicagoResponse,
  type MetMuseumObjectResponse,
  type MetMuseumSearchResponse,
  type WallpaperHandler,
} from "components/system/Desktop/Wallpapers/types";
import {
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_HOUR,
  MILLISECONDS_IN_SECOND,
  ONE_TIME_PASSIVE_EVENT,
} from "utils/constants";
import { jsonFetch, viewHeight, viewWidth } from "utils/functions";

const API_URL = {
  APOD: "https://science.nasa.gov/wp-json/wp/v2/apod-basic",
  ART_INSTITUTE_OF_CHICAGO: "https://api.artic.edu/api/v1/artworks/search",
  MET_MUSEUM: "https://collectionapi.metmuseum.org/public/collection",
};

const APOD_FIRST_DAY = Date.UTC(1995, 5, 16);

// Stand-in for posts whose image wasn't migrated to science.nasa.gov
const APOD_PLACEHOLDER_IMAGE = "/images/misc/news-thumbnail.png";

// Query string, as their Cloudflare blocks the preflight of a JSON POST
const ART_INSTITUTE_OF_CHICAGO_SEARCH = {
  boost: "false",
  fields: "image_id,thumbnail",
  limit: "1",
  "query[function_score][boost_mode]": "replace",
  "query[function_score][query][bool][filter][0][term][is_public_domain]":
    "true",
  // Painting
  "query[function_score][query][bool][filter][1][term][artwork_type_id]": "1",
  "query[function_score][query][bool][filter][2][exists][field]": "image_id",
  "query[function_score][random_score][field]": "id",
};

const ART_INSTITUTE_OF_CHICAGO_MAX_CACHED_WIDTH = 1686;

// Widths their CDN caches (the larger one for public domain works only)
const ART_INSTITUTE_OF_CHICAGO_CACHED_WIDTHS = [
  843,
  ART_INSTITUTE_OF_CHICAGO_MAX_CACHED_WIDTH,
];

const LOREM_PICSUM_MAX_SIZE = 5000;

// Largest size an image shows at when fit to the screen, capped at its own
const fitToScreen = (width: number, height: number): [number, number] => {
  const { devicePixelRatio, screen } = window;
  // iOS keeps the screen's portrait sides when rotated to landscape
  const [screenWidth, screenHeight] =
    screen.height > screen.width && viewWidth() > viewHeight()
      ? [screen.height, screen.width]
      : [screen.width, screen.height];
  const scale = Math.min(
    1,
    (screenWidth * devicePixelRatio) / width,
    (screenHeight * devicePixelRatio) / height
  );

  return [Math.round(width * scale), Math.round(height * scale)];
};

// As an image, since artic.edu blocks HEAD and CSS then reuses the download
const isImageOk = (
  url: string,
  signal: AbortSignal,
  minWidth = 0
): Promise<boolean> =>
  new Promise((resolve) => {
    const image = new Image();

    image.addEventListener(
      "load",
      () => resolve(image.naturalWidth >= minWidth),
      ONE_TIME_PASSIVE_EVENT
    );
    image.addEventListener(
      "error",
      () => resolve(false),
      ONE_TIME_PASSIVE_EVENT
    );
    signal.addEventListener(
      "abort",
      () => resolve(false),
      ONE_TIME_PASSIVE_EVENT
    );

    image.fetchPriority = "high";
    image.src = url;
  });

const createArtworkHandler =
  (
    fetchUrl: (signal: AbortSignal, isAlt: boolean) => Promise<string>,
    updateTimeout = MILLISECONDS_IN_HOUR
  ): WallpaperHandler =>
  async ({ isAlt, signal }) => {
    const maybeFetchArtwork = async (attempt = 1): Promise<string> => {
      try {
        const url = await fetchUrl(signal, isAlt);

        if (url) return url;
      } catch {
        // Ignore failure to get wallpaper
      }

      return attempt < MAX_RETRIES
        ? await new Promise((resolve) => {
            setTimeout(
              () => resolve(maybeFetchArtwork(attempt + 1)),
              MILLISECONDS_IN_SECOND
            );
          })
        : "";
    };

    return {
      fallbackBackground: "",
      newWallpaperFit: "fit",
      updateTimeout,
      wallpaperUrl: await maybeFetchArtwork(),
    };
  };

export const wallpaperHandler: Record<string, WallpaperHandler> = {
  APOD: createArtworkHandler(async (signal, isAlt) => {
    const page = isAlt
      ? Math.ceil(
          (Math.random() * (Date.now() - APOD_FIRST_DAY)) / MILLISECONDS_IN_DAY
        )
      : 1;
    const [{ hdurl } = {}] = await jsonFetch<ApodResponse[]>(
      `${API_URL.APOD}?_fields=hdurl&page=${page}&per_page=1`,
      { signal }
    );

    if (hdurl && !hdurl.includes(APOD_PLACEHOLDER_IMAGE)) {
      const url = new URL(hdurl);
      const [width, height] = fitToScreen(
        Number(url.searchParams.get("w")),
        Number(url.searchParams.get("h"))
      );

      // Resizes dynamicimage urls (upscaling too), content/dam ones ignore it
      if (width && height) {
        url.searchParams.set("w", width.toString());
        url.searchParams.set("h", height.toString());
      }

      if (await isImageOk(url.href, signal)) return url.href;
    }

    return "";
  }, MILLISECONDS_IN_DAY),
  ART_INSTITUTE_OF_CHICAGO: createArtworkHandler(async (signal) => {
    const searchParams = new URLSearchParams({
      ...ART_INSTITUTE_OF_CHICAGO_SEARCH,
      "query[function_score][random_score][seed]": Date.now().toString(),
    });
    const { data: [{ image_id, thumbnail } = {}] = [] } =
      await jsonFetch<ArtInstituteOfChicagoResponse>(
        `${API_URL.ART_INSTITUTE_OF_CHICAGO}?${searchParams.toString()}`,
        { signal }
      );

    if (image_id && thumbnail) {
      const getUrl = (width: number): string =>
        `https://www.artic.edu/iiif/2/${image_id}/full/${width},/0/default.jpg`;
      const [fitWidth] = fitToScreen(thumbnail.width, thumbnail.height);
      const width =
        ART_INSTITUTE_OF_CHICAGO_CACHED_WIDTHS.find(
          (cachedWidth) =>
            cachedWidth >= fitWidth && cachedWidth <= thumbnail.width
        ) ?? fitWidth;

      if (await isImageOk(getUrl(width), signal, width)) return getUrl(width);

      // Uncached widths can get redirected down to 843
      if (
        width > ART_INSTITUTE_OF_CHICAGO_MAX_CACHED_WIDTH &&
        (await isImageOk(
          getUrl(ART_INSTITUTE_OF_CHICAGO_MAX_CACHED_WIDTH),
          signal
        ))
      ) {
        return getUrl(ART_INSTITUTE_OF_CHICAGO_MAX_CACHED_WIDTH);
      }
    }

    return "";
  }),
  LOREM_PICSUM: () => {
    const scale = Math.min(
      window.devicePixelRatio,
      LOREM_PICSUM_MAX_SIZE / viewWidth(),
      LOREM_PICSUM_MAX_SIZE / viewHeight()
    );
    const size = `${Math.round(viewWidth() * scale)}/${Math.round(viewHeight() * scale)}`;
    const createLoremPicsumUrl = (): string =>
      `https://picsum.photos/seed/${Math.floor(Math.random() * Date.now())}/${size}`;

    return {
      fallbackBackground: createLoremPicsumUrl(),
      newWallpaperFit: "fill",
      updateTimeout: MILLISECONDS_IN_HOUR,
      wallpaperUrl: createLoremPicsumUrl(),
    };
  },
  MET_MUSEUM: (() => {
    let total = 0;

    return createArtworkHandler(async (signal) => {
      const searchUrl = `${API_URL.MET_MUSEUM}/v1.1/search?departmentId=11&hasImages=true&limit=1`;

      total ||= (
        await jsonFetch<MetMuseumSearchResponse>(searchUrl, { signal })
      ).total;

      const [randomId] =
        (
          await jsonFetch<MetMuseumSearchResponse>(
            `${searchUrl}&offset=${Math.floor(Math.random() * total)}`,
            { signal }
          )
        ).objectIDs ?? [];

      if (randomId) {
        const { isPublicDomain, primaryImage, primaryImageSmall } =
          await jsonFetch<MetMuseumObjectResponse>(
            `${API_URL.MET_MUSEUM}/v1/objects/${randomId}`,
            { signal }
          );

        if (isPublicDomain && primaryImage) {
          if (await isImageOk(primaryImage, signal)) return primaryImage;
          if (
            primaryImageSmall &&
            (await isImageOk(primaryImageSmall, signal))
          ) {
            return primaryImageSmall;
          }
        }
      }

      return "";
    });
  })(),
};
