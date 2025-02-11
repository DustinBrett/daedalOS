import type videojs from "video.js";

export type VideoPlayer = ReturnType<typeof videojs> & {
  tech_: {
    setCurrentTime: (seconds: number) => void;
    stopTrackingCurrentTime: () => void;
  };
};

export type ControlBar = {
  controlBar: {
    fullscreenToggle: { hide: () => void; show: () => void };
    pictureInPictureToggle: { hide: () => void; show: () => void };
    playToggle: {
      hide: () => void;
      off: (event: string, callback: () => void) => void;
      on: (event: string, callback: () => void) => void;
      show: () => void;
    };
  };
};

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

export type CodecBox = {
  exit: () => void;
  pause: () => void;
  volume: (volume: number) => void;
};

declare global {
  interface Window {
    initCodecBox?: (config: {
      canvas: HTMLCanvasElement;
      file: File;
      onDecoding: (time: number) => void;
      onError: () => void;
      onPlay: ({ duration }: { duration: number }) => void;
    }) => CodecBox;
    videojs: typeof videojs;
  }
}
