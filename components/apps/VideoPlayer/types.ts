type VideoSource = {
  src: string;
  type: string;
};

export type VideoOptions = {
  autoplay: boolean;
  controls?: boolean;
  preload: string;
  responsive: boolean;
  sources: VideoSource[];
  techOrder?: string[];
  youtube?: {
    ytControls: number;
  };
};

export type VideoPlayer = {
  dispose: () => void;
  src: (sources: VideoSource[]) => void;
};

declare global {
  interface Window {
    videojs: (video: HTMLVideoElement, options: VideoOptions) => VideoPlayer;
  }
}
