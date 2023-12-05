import type videojs from "video.js";

export type VideoPlayer = ReturnType<typeof videojs>;

export type SourceObjectWithUrl = videojs.Tech.SourceObject & { url: string };

export type YouTubePlayerQuality =
  | "hd2160"
  | "hd1440"
  | "hd1080"
  | "hd720"
  | "highres"
  | "large"
  | "medium"
  | "small"
  | "tiny"
  | "auto";

export type YouTubePlayer = {
  getPlaybackQuality: () => YouTubePlayerQuality;
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
