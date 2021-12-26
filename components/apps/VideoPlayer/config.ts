import { extname } from "path";

export const YT_TYPE = "video/youtube";

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
};

export const libs = [
  "/Program Files/Video.js/video-js.min.css",
  "/Program Files/Video.js/video.min.js",
  "/Program Files/Video.js/Youtube.min.js",
];

export const getVideoType = (url: string): string | undefined => {
  switch (extname(url).toLowerCase()) {
    case ".mkv":
    case ".mp4":
      return "video/mp4";
    case ".ogg":
    case ".ogm":
    case ".ogv":
      return "video/ogg";
    case ".webm":
      return "video/webm";
    default:
      return undefined;
  }
};
