import type { Size } from "components/system/Window/RndWindow/useResizable";

export const DEFAULT_LOCALE = "en";

export const DEFAULT_WINDOW_SIZE: Size = {
  height: "200px",
  width: "250px",
};

export const DOUBLE_CLICK_TIMEOUT_IN_MILLISECONDS = 500;

export const IMAGE_FILE_EXTENSIONS = new Set([
  ".apng",
  ".avif",
  ".bmp",
  ".cur",
  ".gif",
  ".ico",
  ".jfif",
  ".jif",
  ".jpe",
  ".jpeg",
  ".jpg",
  ".pjp",
  ".pjpeg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
  ".xbm",
]);

export const MILLISECONDS_IN_SECOND = 1000;

export const MOUNTABLE_EXTENSIONS = new Set([".iso", ".zip"]);

export const MP3_MIME_TYPE = "audio/mpeg";

export const ONE_TIME_PASSIVE_EVENT = {
  once: true,
  passive: true,
} as AddEventListenerOptions;

export const PROCESS_DELIMITER = "__";

export const SHORTCUT_EXTENSION = ".url";

export const WINDOW_TRANSITION_DURATION_IN_MILLISECONDS = 250;
