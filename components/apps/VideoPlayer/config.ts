import type { VideoJsPlayerOptions } from "video.js";

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
  inactivityTimeout: 1000,
  preload: "auto",
  youtube: {
    enablePrivacyEnhancedMode: true,
    ytControls: 2,
  },
} as VideoJsPlayerOptions;
