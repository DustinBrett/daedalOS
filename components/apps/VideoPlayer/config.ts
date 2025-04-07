import { type VideoJsPlayerOptions } from "video.js";
import { type YouTubePlayerQuality } from "components/apps/VideoPlayer/types";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

export const YT_TYPE = "video/youtube";

export const CONTROL_BAR_HEIGHT = 30;

export const VideoResizeKey: Record<string, number> = {
  "1": 4,
  "2": 2,
  "3": 1,
  "4": 0.5,
};

export const config = {
  autoplay: true,
  controlBar: {
    children: [
      "playToggle",
      "currentTimeDisplay",
      "progressControl",
      "durationDisplay",
      "volumePanel",
      "pictureInPictureToggle",
      "fullscreenToggle",
    ],
    volumePanel: {
      inline: false,
    },
  },
  inactivityTimeout: MILLISECONDS_IN_SECOND,
  preload: "auto",
  youtube: {
    enablePrivacyEnhancedMode: true,
    ytControls: 2,
  },
} as VideoJsPlayerOptions;

const TINY = [144, 256] as [number, number];
const SMALL = [240, 426] as [number, number];
const MEDIUM = [360, 640] as [number, number];
const LARGE = [480, 854] as [number, number];
const HD720 = [720, 1280] as [number, number];
const HD1080 = [1080, 1920] as [number, number];
const HD1440 = [1440, 2560] as [number, number];
const HD2160 = [2160, 3840] as [number, number];

export const DEFAULT_QUALITY_SIZE = MEDIUM;

export const ytQualitySizeMap: Record<YouTubePlayerQuality, [number, number]> =
  {
    auto: DEFAULT_QUALITY_SIZE,
    hd1080: HD1080,
    hd1440: HD1440,
    hd2160: HD2160,
    hd720: HD720,
    highres: LARGE,
    large: LARGE,
    medium: MEDIUM,
    small: SMALL,
    tiny: TINY,
  };
