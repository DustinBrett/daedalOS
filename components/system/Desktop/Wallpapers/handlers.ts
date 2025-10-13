import {
  type WallpaperHandler,
  type ApodResponse,
  type ArtInstituteOfChicagoResponse,
} from "components/system/Desktop/Wallpapers/types";
import { type WallpaperFit } from "contexts/session/types";
import { MILLISECONDS_IN_DAY, MILLISECONDS_IN_HOUR } from "utils/constants";
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
    const requestPayload = {
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
    };
    const response = (await jsonFetch(API_URL.ART_INSTITUTE_OF_CHICAGO, {
      body: JSON.stringify(requestPayload),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })) as ArtInstituteOfChicagoResponse;
    const imageUrl = (isMaxSize: boolean): string =>
      response?.data?.[0]?.image_id
        ? `https://www.artic.edu/iiif/2/${response.data[0].image_id}/full/${
            isMaxSize ? "1686" : "843"
          },/0/default.jpg`
        : "";

    return {
      fallbackBackground: imageUrl(false),
      newWallpaperFit: "fit",
      updateTimeout: MILLISECONDS_IN_HOUR,
      wallpaperUrl: imageUrl(true),
    };
  },
  LOREM_PICSUM: () => ({
    fallbackBackground: "",
    newWallpaperFit: "fill",
    updateTimeout: MILLISECONDS_IN_HOUR,
    wallpaperUrl: `https://picsum.photos/seed/${Date.now()}/${viewWidth()}/${viewHeight()}`,
  }),
};
