type VideoSource = {
  src: string;
  type: string;
};

export type VideoOptions = {
  autoplay: boolean;
  controlBar: {
    children: string[];
    volumePanel: {
      inline: boolean;
    };
  };
  controls?: boolean;
  inactivityTimeout?: number;
  preload: string;
  techOrder?: string[];
  youtube?: {
    ytControls: number;
  };
};

export type VideoPlayer = {
  dispose: () => void;
  on: (event: string, callback: () => void) => void;
  src: (sources: VideoSource[]) => void;
  videoHeight: () => number;
  videoWidth: () => number;
};

declare global {
  interface Window {
    videojs: (video: HTMLVideoElement, options: VideoOptions) => VideoPlayer;
  }
}
