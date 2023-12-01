import type videojs from "video.js";

export type VideoPlayer = ReturnType<typeof videojs>;

export type SourceObjectWithUrl = videojs.Tech.SourceObject & { url: string };

export type YouTubePlayer = {
  getSize: () => {
    height: number;
    width: number;
  };
  videoTitle: string;
};

export type YouTubeTech = {
  tech_?: {
    ytPlayer?: YouTubePlayer;
  };
};

declare global {
  interface Window {
    videojs: typeof videojs;
  }
}
