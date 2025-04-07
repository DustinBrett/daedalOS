import { useEffect } from "react";
import { type Media } from "mediainfo.js";
import {
  type PropertiesMetaData,
  type MetaData,
} from "components/system/Dialogs/Properties";
import { analyzeFileToObject } from "utils/mediainfo";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

const FILTER_KEYS = new Set([
  "@type",
  "@typeorder",
  "DataSize",
  "extra",
  "FileSize",
  "ID",
  "StreamOrder",
  "UniqueID",
  "VideoCount",
]);

const withLeadingZero = (value: number): string =>
  value.toString().padStart(2, "0");

const maybeConvertValue = (key: string, value: number): string | number => {
  if (key === "Duration") {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value - hours * 3600) / 60);
    const seconds = Math.floor(value - hours * 3600 - minutes * 60);

    return `${withLeadingZero(hours)}:${withLeadingZero(minutes)}:${withLeadingZero(seconds)}`;
  }

  if (key === "OverallBitRate" || key === "BitRate") {
    return `${Math.floor(value / MILLISECONDS_IN_SECOND)}kbps`;
  }

  if (key === "FrameRate") {
    return `${value} frames/second`;
  }

  return value;
};

const convertToMetaData = (mediaTypeData?: Media): MetaData =>
  mediaTypeData?.track?.reduce(
    (data, track) => ({
      ...data,
      [track["@type"]]: Object.fromEntries(
        [...Object.entries(track), ...Object.entries(track.extra || {})]
          .filter(([key]) => !FILTER_KEYS.has(key))
          .map(([key, value]) => [key, maybeConvertValue(key, value as number)])
      ),
    }),
    {}
  ) || {};

const useMediaType = (
  fileData: Buffer | undefined,
  currentMediaType: MetaData | undefined,
  setMetaData: React.Dispatch<React.SetStateAction<PropertiesMetaData>>
): void => {
  useEffect(() => {
    if (fileData && !currentMediaType) {
      const updateMetaData = (metaData: MetaData = {}): void =>
        setMetaData((currentMetaData) => ({
          ...currentMetaData,
          mediaType: metaData,
        }));

      analyzeFileToObject(fileData)
        .then((data) => updateMetaData(convertToMetaData(data)))
        .catch(() => updateMetaData({}));
    }
  }, [currentMediaType, fileData, setMetaData]);
};

export default useMediaType;
