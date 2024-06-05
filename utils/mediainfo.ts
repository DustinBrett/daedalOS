import { type Media, type FormatType, type MediaInfo } from "mediainfo.js";

const getMediaInfo = async <T extends FormatType>(
  format: T
): Promise<MediaInfo<T>> => {
  const { default: MediaInfoFactory } = await import("mediainfo.js");

  return MediaInfoFactory<T>({
    format,
    locateFile: (wasmFile: string) => `System/mediainfo.js/${wasmFile}`,
  });
};

export const analyzeFileToText = async (file: Buffer): Promise<string> =>
  (await getMediaInfo("text")).analyzeData(
    () => file.length,
    () => file
  );

export const analyzeFileToObject = async (
  file: Buffer
): Promise<Media | undefined> =>
  (
    await (
      await getMediaInfo("object")
    ).analyzeData(
      () => file.length,
      () => file
    )
  ).media;
