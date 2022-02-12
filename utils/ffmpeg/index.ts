import type { LocalEcho } from "components/apps/Terminal/types";
import { basename, dirname, extname, join } from "path";
import type {
  FFmpegTranscodeFile,
  IFFmpegInstance,
  IFFmpegLog,
} from "utils/ffmpeg/types";
import { loadFiles } from "utils/functions";

const getFFmpeg = async (localEcho?: LocalEcho): Promise<IFFmpegInstance> => {
  if (!window.FFmpeg) {
    await loadFiles(["/Program Files/ffmpeg/ffmpeg.min.js"]);
  }

  if (window.FFmpeg) {
    window.FFmpegInstance?.exit();
    window.FFmpegInstance = window.FFmpeg.createFFmpeg({
      corePath: "/Program Files/ffmpeg/ffmpeg-core.js",
      log: false,
      logger: ({ message }: IFFmpegLog) => {
        localEcho?.println(message);
        console.info(message);
      },
      mainName: "main",
    });
    await window.FFmpegInstance.load();
  }

  return window.FFmpegInstance;
};

export const transcode = async (
  files: FFmpegTranscodeFile[],
  extension: string,
  localEcho?: LocalEcho
): Promise<FFmpegTranscodeFile[]> => {
  const ffmpeg = await getFFmpeg(localEcho);
  const returnFiles: FFmpegTranscodeFile[] = [];

  await Promise.all(
    files.map(async ([fileName, fileData]) => {
      const baseName = basename(fileName);
      const newName = `${basename(fileName, extname(fileName))}.${extension}`;

      ffmpeg.FS("writeFile", baseName, fileData);
      await ffmpeg.run("-i", baseName, newName);

      returnFiles.push([
        join(dirname(fileName), newName),
        Buffer.from(ffmpeg.FS("readFile", newName) as Uint8Array),
      ]);
    })
  );

  return returnFiles;
};
