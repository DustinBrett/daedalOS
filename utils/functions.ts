import { GOOGLE_SEARCH_QUERY } from "components/apps/Browser/config";
import type { Size } from "components/system/Window/RndWindow/useResizable";
import { extname } from "path";
import { stripUnit } from "polished";
import { ONE_TIME_PASSIVE_EVENT, TASKBAR_HEIGHT } from "utils/constants";

export const bufferToBlob = (buffer: Buffer): Blob =>
  new Blob([new Uint8Array(buffer)]);

export const bufferToUrl = (buffer: Buffer): string =>
  URL.createObjectURL(bufferToBlob(buffer));

export const cleanUpBufferUrl = (url: string): void => URL.revokeObjectURL(url);

const loadScript = (src: string): Promise<Event> =>
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

const loadStyle = (href: string): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedStyles = [...document.querySelectorAll("link")];

    if (loadedStyles.some((link) => link.href.endsWith(href))) {
      resolve(new Event("Already loaded."));
    } else {
      const link = document.createElement("link");

      link.rel = "stylesheet";
      link.href = href;
      link.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
      link.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

      document.head.appendChild(link);
    }
  });

export const loadFiles = async (files: string[]): Promise<void> => {
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    await (extname(file).toLowerCase() === ".css"
      ? loadStyle(encodeURI(file))
      : loadScript(encodeURI(file)));
  }
};

export const pxToNum = (value: number | string = 0): number =>
  Number(stripUnit(value));

export const viewHeight = (): number =>
  Math.min(window.innerHeight, window.screen.height);

export const viewWidth = (): number =>
  Math.min(window.innerWidth, window.screen.width);

export const maxSize = (size: Size, lockAspectRatio: boolean): Size => {
  const [vh, vw] = [viewHeight(), viewWidth()];
  const setHeight = Number(size.height);
  const setWidth = Number(size.width);
  const height = Math.min(setHeight, vh - TASKBAR_HEIGHT);
  const width = Math.min(setWidth, vw);

  if (!lockAspectRatio) return { height, width };

  const forcedHeight = setHeight !== height;
  const forcedWidth = setWidth !== width;

  if (!forcedHeight && !forcedWidth) return { height, width };

  return setWidth > setHeight
    ? {
        height: height * (setHeight / setWidth),
        width:
          setWidth === vw && forcedHeight
            ? width * (setHeight / setWidth)
            : width,
      }
    : {
        height: width * (setWidth / setHeight),
        width:
          setHeight === vh && forcedWidth
            ? height * (setWidth / setHeight)
            : height,
      };
};

const bytesInKB = 1024;
const bytesInMB = 1024 * 999;
const bytesInGB = 1024 * 1024 * 999;
const bytesInTB = 1024 * 1024 * 1024 * 999;

const formatNumber = (number: number): string =>
  new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: number < 1 ? 2 : 3,
    minimumSignificantDigits: number < 1 ? 2 : 3,
  }).format(Number(number.toFixed(4).slice(0, -2)));

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

export const lockTitle = (): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Object.defineProperty(document, "title", { set: () => {} });
    // eslint-disable-next-line no-empty
  } catch {}
};

export const getTZOffsetISOString = (): string => {
  const date = new Date();

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString();
};

export const getUrlOrSearch = (input: string): string => {
  const hasHttpSchema =
    input.startsWith("http://") || input.startsWith("https://");
  const hasTld =
    input.endsWith(".com") ||
    input.endsWith(".ca") ||
    input.endsWith(".net") ||
    input.endsWith(".org");

  try {
    const { href } = new URL(
      hasHttpSchema || !hasTld ? input : `https://${input}`
    );

    return href;
  } catch {
    return `${GOOGLE_SEARCH_QUERY}${input}`;
  }
};

export const isFirefox = (): boolean =>
  typeof window !== "undefined" && /firefox/i.test(window.navigator.userAgent);

export const isSafari = (): boolean =>
  typeof window !== "undefined" &&
  /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

export const haltEvent = (
  event: Event | React.DragEvent | React.KeyboardEvent | React.MouseEvent
): void => {
  event.preventDefault();
  event.stopPropagation();
};

export const createOffscreenCanvas = (
  containerElement: HTMLElement
): OffscreenCanvas => {
  const canvas = document.createElement("canvas");

  canvas.height = containerElement.clientHeight;
  canvas.width = containerElement.clientWidth;

  containerElement.appendChild(canvas);

  return canvas.transferControlToOffscreen();
};

export const getSearchParam = (param: string): string =>
  new URLSearchParams(window.location.search).get(param) || "";
