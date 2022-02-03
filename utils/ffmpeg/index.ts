import type { LocalEcho } from "components/apps/Terminal/types";
import { basename, extname } from "path";
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

  if (!window.FFmpegInstance && window.FFmpeg) {
    window.FFmpegInstance = window.FFmpeg.createFFmpeg({
      corePath: "/Program Files/ffmpeg/ffmpeg-core.js",
      log: false,
      logger: ({ type, message }: IFFmpegLog) => {
        if (type === "fferr") localEcho?.println(message);
      },
      mainName: "main",
    });

    await window.FFmpegInstance.load();
  }

  return window.FFmpegInstance;
};

export const transcode = async (
  files: FFmpegTranscodeFile[],
  targetExtension: string,
  localEcho?: LocalEcho
): Promise<FFmpegTranscodeFile[]> => {
  const ffmpeg = await getFFmpeg(localEcho);
  const returnFiles: FFmpegTranscodeFile[] = [];

  await Promise.all(
    files.map(async ([fileName, fileData]) => {
      const newName = `${basename(
        fileName,
        extname(fileName)
      )}.${targetExtension}`;

      ffmpeg.FS("writeFile", fileName, fileData);
      await ffmpeg.run("-i", fileName, newName);

      returnFiles.push([
        newName,
        Buffer.from(ffmpeg.FS("readFile", newName) as Uint8Array),
      ]);
    })
  );

  return returnFiles;
};
