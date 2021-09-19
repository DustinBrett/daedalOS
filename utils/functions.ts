import { stripUnit } from "polished";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

export const bufferToBlob = (buffer: Buffer): Blob =>
  new Blob([new Uint8Array(buffer)]);

export const bufferToUrl = (buffer: Buffer): string =>
  URL.createObjectURL(bufferToBlob(buffer));

export const cleanUpBufferUrl = (url: string): void => URL.revokeObjectURL(url);

export const loadScript = (src: string): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedScripts = [...document.scripts];

    if (loadedScripts.some((script) => script.src.endsWith(src))) {
      resolve(new Event("Already loaded."));
    } else {
      const script = document.createElement("script");

      script.async = false;
      script.src = src;
      script.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
      script.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

      document.head.appendChild(script);
    }
  });

export const loadFiles = async (files: string[]): Promise<Event[]> =>
  Promise.all(files.map((file) => loadScript(encodeURI(file))));

export const pxToNum = (value: string | number = 0): number =>
  Number(stripUnit(value));

export const cleanUpGlobals = (globals: string[]): void =>
  globals.forEach((global) => delete (window as never)[global]);

export const viewHeight = (): number =>
  Math.min(window.innerHeight, window.screen.height);

export const viewWidth = (): number =>
  Math.min(window.innerWidth, window.screen.width);

const bytesInKB = 1024;
const bytesInMB = 1024 * 999;
const bytesInGB = 1024 * 1024 * 999;
const bytesInTB = 1024 * 1024 * 1024 * 999;

const formatNumber = (number: number): string =>
  new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 3,
    minimumSignificantDigits: 3,
  }).format(number);

export const getFormattedSize = (size = 0): string => {
  if (size === 1) return "1 byte";
  if (size < bytesInKB) return `${size} bytes`;
  if (size < bytesInMB) return `${formatNumber(size / bytesInKB)} KB`;
  if (size < bytesInGB)
    return `${formatNumber(size / bytesInKB / bytesInKB)} MB`;
  if (size < bytesInTB)
    return `${formatNumber(size / bytesInKB / bytesInKB / bytesInKB)} GB`;

  return `${size} bytes`;
};
