import type videojs from "video.js";

declare global {
  interface Window {
    videojs: typeof videojs;
  }
}
