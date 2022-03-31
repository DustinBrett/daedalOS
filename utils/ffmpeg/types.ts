export type IFFmpegInstance = {
  FS: (
    command: string,
    fileName: string,
    fileData?: Buffer
  ) => Uint8Array | void;
  exit: () => void;
  load: () => Promise<void>;
  run: (...commandArgs: string[]) => Promise<void>;
};

export type IFFmpegLog = {
  message: string;
  type: string;
};

type FFmpegConfig = {
  corePath: string;
  log: boolean;
  logger: (log: IFFmpegLog) => void;
  mainName: string;
};

export type FFmpegTranscodeFile = [string, Buffer];

declare global {
  interface Window {
    FFmpeg: {
      createFFmpeg: (config: FFmpegConfig) => IFFmpegInstance;
    };
    FFmpegInstance: IFFmpegInstance;
  }
}
