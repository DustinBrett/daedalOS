export type ImageMagickConvertFile = [string, Buffer];

type ImageMagickFile = {
  content: Buffer;
  name: string;
};

type ImageMagickConvertedFile = {
  blob: Blob;
  name: string;
};

declare global {
  interface Window {
    ["wasm-imagemagick"]: {
      call: (
        files: ImageMagickFile[],
        command: string[]
      ) => {
        stdout: string[];
        stderr: string[];
        exitCode: number;
        outputFiles: ImageMagickConvertedFile[];
      };
    };
  }
}
