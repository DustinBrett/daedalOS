import type videojs from "video.js";

export type VideoPlayer = ReturnType<typeof videojs>;

export type SourceObjectWithUrl = videojs.Tech.SourceObject & { url: string };

declare global {
  interface Window {
    videojs: typeof videojs;
  }
}
