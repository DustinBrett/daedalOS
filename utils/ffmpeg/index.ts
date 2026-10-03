import { basename, dirname, extname, join } from "path";
import { type FFmpeg } from "@ffmpeg/ffmpeg";
import { type FFmpegTranscodeFile } from "utils/ffmpeg/types";
import { fetchBlob } from "utils/functions";

let coreUrls: Promise<string[]> | undefined;

// Conversions started together would otherwise each download the core, and
// the browser can fail one of those while caching the other
const getCoreUrls = (): Promise<string[]> => {
  coreUrls ??= Promise.all(
    ["/System/ffmpeg/ffmpeg-core.js", "/System/ffmpeg/ffmpeg-core.wasm"].map(
      async (url) => URL.createObjectURL(await fetchBlob(url))
    )
  ).catch((error: unknown) => {
    coreUrls = undefined;

    throw error;
  });

  return coreUrls;
};

export const getFFmpeg = async (
  printLn: (message: string) => void = console.info
): Promise<FFmpeg> => {
  const [{ FFmpeg: CreateFFmpeg }, [coreURL, wasmURL]] = await Promise.all([
    import("@ffmpeg/ffmpeg"),
    getCoreUrls(),
  ]);
  const ffmpeg = new CreateFFmpeg();

  ffmpeg.on("log", ({ message }) => printLn(message));

  await ffmpeg.load({ coreURL, wasmURL });

  return ffmpeg;
};

export const transcode = async (
  files: FFmpegTranscodeFile[],
  extension: string,
  printLn?: (message: string) => void
): Promise<FFmpegTranscodeFile[]> => {
  const ffmpeg = await getFFmpeg(printLn);
  const returnFiles: FFmpegTranscodeFile[] = [];

  try {
    await Promise.all(
      files.map(async ([fileName, fileData]) => {
        const baseName = basename(fileName);
        const newName = `${basename(fileName, extname(fileName))}.${extension}`;

        await ffmpeg.writeFile(baseName, fileData);
        await ffmpeg.exec(["-i", baseName, newName]);

        returnFiles.push([
          join(dirname(fileName), newName),
          Buffer.from((await ffmpeg.readFile(newName)) as Uint8Array),
        ]);
      })
    );
  } finally {
    ffmpeg.terminate();
  }

  return returnFiles;
};
