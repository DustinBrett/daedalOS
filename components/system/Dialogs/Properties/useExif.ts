import { useEffect } from "react";
import { type PropertiesMetaData } from "components/system/Dialogs/Properties";

type NumberObject = { toString: () => string };

type EXIFData = string | number | NumberObject;

type EXIFObject = Record<string, EXIFData>;

const maybeConvertValue = (value: EXIFData): string | number => {
  if (typeof value === "number" || typeof value === "string") return value;
  if ("toString" in value) return value.toString();

  return "";
};

const FILTER_KEYS = new Set(["UserComment"]);

const useExif = (
  fileData: Buffer | undefined,
  currentExif: Record<string, unknown> | undefined,
  setMetaData: React.Dispatch<React.SetStateAction<PropertiesMetaData>>
): void => {
  useEffect(() => {
    if (fileData && !currentExif) {
      import("exif-js").then(({ default: EXIF }) => {
        const { thumbnail, ...data } = EXIF.readFromBinaryFile(
          fileData?.buffer
        ) as EXIFObject;
        const { blob, ...thumbnailData } = (thumbnail as EXIFObject) || {};
        const thumbEntries = Object.entries(thumbnailData);
        const exifEntries = Object.entries(data);
        const hasThumbData = thumbEntries.length > 0;
        const hasExifData = exifEntries.length > 0;

        setMetaData((currentMetaData) => ({
          ...currentMetaData,
          exif:
            hasThumbData || hasExifData
              ? {
                  ...(hasExifData
                    ? {
                        EXIF: Object.fromEntries(
                          exifEntries
                            .filter(([key]) => !FILTER_KEYS.has(key))
                            .map(([key, value]) => [
                              key,
                              maybeConvertValue(value),
                            ])
                        ),
                      }
                    : {}),
                  ...(hasThumbData
                    ? {
                        Thumbnail: {
                          ...Object.fromEntries(
                            thumbEntries.map(([key, value]) => [
                              key,
                              maybeConvertValue(value),
                            ])
                          ),
                          ...(blob
                            ? { Image: URL.createObjectURL(blob as Blob) }
                            : {}),
                        },
                      }
                    : {}),
                }
              : undefined,
        }));
      });
    }
  }, [currentExif, fileData, setMetaData]);
};

export default useExif;
