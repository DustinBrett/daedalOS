import { MAX_RETRIES } from "components/system/Desktop/Wallpapers/constants";
import {
  type WallpaperHandler,
  type ApodResponse,
  type ArtInstituteOfChicagoResponse,
} from "components/system/Desktop/Wallpapers/types";
import { type WallpaperFit } from "contexts/session/types";
import {
  HIGH_PRIORITY_REQUEST,
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_HOUR,
} from "utils/constants";
import {
  jsonFetch,
  viewWidth,
  isYouTubeUrl,
  getYouTubeUrlId,
  viewHeight,
} from "utils/functions";

const API_URL = {
  APOD: "https://api.nasa.gov/planetary/apod",
  ART_INSTITUTE_OF_CHICAGO: "https://api.artic.edu/api/v1/artworks/search",
};

export const wallpaperHandler: Record<string, WallpaperHandler> = {
  APOD: async ({ isAlt }) => {
    const response = await jsonFetch(
      `${API_URL.APOD}?${isAlt ? "count=1&" : ""}api_key=DEMO_KEY`
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
  ART_INSTITUTE_OF_CHICAGO: async () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const fetchArtwork = (): Promise<ArtInstituteOfChicagoResponse> =>
      jsonFetch<ArtInstituteOfChicagoResponse>(
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
        }
      );
    let wallpaperUrl = "";

    for (let a = 0; a < MAX_RETRIES; a++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const { data: [{ image_id } = {}] = [] } = await fetchArtwork();

        if (image_id) {
          const url = `https://www.artic.edu/iiif/2/${image_id}/full/1686,/0/default.jpg`;

          // eslint-disable-next-line no-await-in-loop
          const { ok } = await fetch(url, {
            ...HIGH_PRIORITY_REQUEST,
            method: "HEAD",
          });

          if (ok) {
            wallpaperUrl = url;
            break;
          }
        }
      } catch {
        // Ignore failure to get wallpaper
      }
    }

    return {
      fallbackBackground: "",
      newWallpaperFit: "fit",
      updateTimeout: MILLISECONDS_IN_HOUR,
      wallpaperUrl,
    };
  },
  LOREM_PICSUM: () => ({
    fallbackBackground: "",
    newWallpaperFit: "fill",
    updateTimeout: MILLISECONDS_IN_HOUR,
    wallpaperUrl: `https://picsum.photos/seed/${Date.now()}/${viewWidth()}/${viewHeight()}`,
  }),
};
