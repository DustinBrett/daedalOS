import { extname } from "path";
import type { VideoJsPlayerOptions } from "video.js";

export const YT_TYPE = "video/youtube";

export const CONTROL_BAR_HEIGHT = 30;

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
  inactivityTimeout: 1000,
  preload: "auto",
  youtube: {
    enablePrivacyEnhancedMode: true,
    ytControls: 2,
  },
} as VideoJsPlayerOptions;

const FALLBACK_TYPE = "video/mp4";

export const getMimeType = (url: string): string | undefined => {
  switch (extname(url).toLowerCase()) {
    case ".m3u8":
      return "application/x-mpegURL";
    case ".m4v":
    case ".mkv":
    case ".mov":
    case ".mp4":
      return "video/mp4";
    case ".oga":
      return "audio/ogg";
    case ".ogg":
    case ".ogm":
    case ".ogv":
      return "video/ogg";
    case ".wav":
      return "audio/wav";
    case ".webm":
      return "video/webm";
    default:
      return FALLBACK_TYPE;
  }
};
