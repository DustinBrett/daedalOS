import { MAX_RETRIES } from "components/system/Desktop/Wallpapers/constants";
import {
  type ApodResponse,
  type ArtInstituteOfChicagoResponse,
  type MetMuseumObjectResponse,
  type MetMuseumSearchResponse,
  type WallpaperHandler,
} from "components/system/Desktop/Wallpapers/types";
import { type WallpaperFit } from "contexts/session/types";
import {
  HIGH_PRIORITY_REQUEST,
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_HOUR,
  MILLISECONDS_IN_SECOND,
} from "utils/constants";
import {
  getYouTubeUrlId,
  isYouTubeUrl,
  jsonFetch,
  viewHeight,
  viewWidth,
} from "utils/functions";

const API_URL = {
  APOD: "https://api.nasa.gov/planetary/apod",
  ART_INSTITUTE_OF_CHICAGO: "https://api.artic.edu/api/v1/artworks/search",
  MET_MUSEUM: "https://collectionapi.metmuseum.org/public/collection/v1",
};

const isResourceOk = async (
  url: string,
  signal: AbortSignal
): Promise<boolean> => {
  try {
    const { ok } = await fetch(url, {
      ...HIGH_PRIORITY_REQUEST,
      method: "HEAD",
      signal,
    });

    return ok;
  } catch {
    return false;
  }
};

const createArtworkHandler =
  (fetchUrl: (signal: AbortSignal) => Promise<string>): WallpaperHandler =>
  async ({ signal }) => {
    const maybeFetchArtwork = async (attempt = 1): Promise<string> => {
      try {
        const url = await fetchUrl(signal);

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
      updateTimeout: MILLISECONDS_IN_HOUR,
      wallpaperUrl: await maybeFetchArtwork(),
    };
  };

export const wallpaperHandler: Record<string, WallpaperHandler> = {
  APOD: async ({ isAlt, signal }) => {
    const response = await jsonFetch(
      `${API_URL.APOD}?${isAlt ? "count=1&" : ""}api_key=DEMO_KEY`,
      { signal }
    );
    const { hdurl, url } = (isAlt ? response[0] : response) as ApodResponse;

    let wallpaperUrl = "";
    let fallbackBackground = "";
    let newWallpaperFit = "" as WallpaperFit;

    if (hdurl || url) {
      wallpaperUrl = (viewWidth() > 1024 ? hdurl : url) || url || "";
      newWallpaperFit = "fit";

      if (isYouTubeUrl(wallpaperUrl)) {
        const ytBaseUrl = `https://i.ytimg.com/vi/${getYouTubeUrlId(
          wallpaperUrl
        )}`;

        wallpaperUrl = `${ytBaseUrl}/maxresdefault.jpg`;
        fallbackBackground = `${ytBaseUrl}/hqdefault.jpg`;
      } else if (hdurl && url && hdurl !== url) {
        fallbackBackground = wallpaperUrl === url ? hdurl : url;
      }
    }

    return {
      fallbackBackground,
      newWallpaperFit,
      updateTimeout: MILLISECONDS_IN_DAY,
      wallpaperUrl,
    };
  },
  ART_INSTITUTE_OF_CHICAGO: createArtworkHandler(async (signal) => {
    const { data: [{ image_id } = {}] = [] } =
      await jsonFetch<ArtInstituteOfChicagoResponse>(
        API_URL.ART_INSTITUTE_OF_CHICAGO,
        {
          body: JSON.stringify({
            boost: false,
            fields: ["image_id"],
            limit: 1,
            query: {
              function_score: {
                boost_mode: "replace",
                query: {
                  bool: {
                    filter: [
                      {
                        term: {
                          is_public_domain: true,
                        },
                      },
                      {
                        terms: {
                          artwork_type_id: [1], // Painting
                        },
                      },
                      {
                        exists: {
                          field: "image_id",
                        },
                      },
                    ],
                  },
                },
                random_score: {
                  field: "id",
                  seed: Date.now(),
                },
              },
            },
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          signal,
        }
      );

    if (image_id) {
      const url = `https://www.artic.edu/iiif/2/${image_id}/full/1686,/0/default.jpg`;

      if (await isResourceOk(url, signal)) return url;
    }

    return "";
  }),
  LOREM_PICSUM: () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const createLoremPicsumUrl = (): string =>
      `https://picsum.photos/seed/${Math.floor(Math.random() * Date.now())}/${viewWidth()}/${viewHeight()}`;

    return {
      fallbackBackground: createLoremPicsumUrl(),
      newWallpaperFit: "fill",
      updateTimeout: MILLISECONDS_IN_HOUR,
      wallpaperUrl: createLoremPicsumUrl(),
    };
  },
  MET_MUSEUM: (() => {
    let cachedIds: number[];

    return createArtworkHandler(async (signal) => {
      cachedIds ??=
        (
          await jsonFetch<MetMuseumSearchResponse>(
            `${API_URL.MET_MUSEUM}/search?hasImages=true&departmentId=11&q=*`,
            { signal }
          )
        )?.objectIDs ?? [];

      if (cachedIds.length > 0) {
        const randomId =
          cachedIds[Math.floor(Math.random() * cachedIds.length)];
        const { isPublicDomain, primaryImage, primaryImageSmall } =
          await jsonFetch<MetMuseumObjectResponse>(
            `${API_URL.MET_MUSEUM}/objects/${randomId}`,
            { signal }
          );

        if (isPublicDomain && primaryImage) {
          if (await isResourceOk(primaryImage, signal)) return primaryImage;
          if (
            primaryImageSmall &&
            (await isResourceOk(primaryImageSmall, signal))
          ) {
            return primaryImageSmall;
          }
        }
      }

      return "";
    });
  })(),
};
