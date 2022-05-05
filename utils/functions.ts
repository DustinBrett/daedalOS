import type { Size } from "components/system/Window/RndWindow/useResizable";
import { extname } from "path";
import type { HTMLAttributes } from "react";
import { useEffect } from "react";
import { ONE_TIME_PASSIVE_EVENT, TASKBAR_HEIGHT } from "utils/constants";

export const GOOGLE_SEARCH_QUERY = "https://www.google.com/search?igu=1&q=";

export const bufferToBlob = (buffer: Buffer, type?: string): Blob =>
  new Blob([buffer], type ? { type } : undefined);

export const bufferToUrl = (buffer: Buffer): string =>
  URL.createObjectURL(bufferToBlob(buffer));

export const imageToBufferUrl = (path: string, buffer: Buffer): string =>
  extname(path) === ".svg"
    ? `data:image/svg+xml;base64,${window.btoa(buffer.toString())}`
    : `data:image/png;base64,${buffer.toString("base64")}`;

export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(blob);
    fileReader.onloadend = () => resolve(fileReader.result as string);
  });

export const cleanUpBufferUrl = (url: string): void => URL.revokeObjectURL(url);

const loadScript = (src: string, defer?: boolean): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedScripts = [...document.scripts];

    if (loadedScripts.some((script) => script.src.endsWith(src))) {
      resolve(new Event("Already loaded."));
    } else {
      const script = document.createElement(
        "script"
      ) as HTMLElementWithPriority<HTMLScriptElement>;

      script.async = false;
      if (defer) script.defer = true;
      script.fetchpriority = "high";
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
      const link = document.createElement(
        "link"
      ) as HTMLElementWithPriority<HTMLLinkElement>;

      link.rel = "stylesheet";
      link.fetchpriority = "high";
      link.href = href;
      link.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
      link.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

      document.head.appendChild(link);
    }
  });

export const loadFiles = async (
  files: string[],
  defer?: boolean
): Promise<void> =>
  files.reduce(async (_promise, file) => {
    await (extname(file).toLowerCase() === ".css"
      ? loadStyle(encodeURI(file))
      : loadScript(encodeURI(file), defer));
  }, Promise.resolve());

export const pxToNum = (value: number | string = 0): number =>
  typeof value === "number" ? value : Number(value.replace("px", ""));

export const viewHeight = (): number =>
  Math.min(window.innerHeight, window.screen.height);

export const viewWidth = (): number =>
  Math.min(window.innerWidth, window.screen.width);

export const isCanvasDrawn = (canvas?: HTMLCanvasElement | null): boolean =>
  canvas instanceof HTMLCanvasElement &&
  Boolean(
    canvas
      .getContext("2d")
      ?.getImageData(0, 0, canvas.width, canvas.height)
      .data.some((channel) => channel !== 0)
  );

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
  if (size < bytesInGB) {
    return `${formatNumber(size / bytesInKB / bytesInKB)} MB`;
  }
  if (size < bytesInTB) {
    return `${formatNumber(size / bytesInKB / bytesInKB / bytesInKB)} GB`;
  }

  return `${size} bytes`;
};

export const useLockTitle = (): void => {
  useEffect(() => {
    try {
      Object.defineProperty(document, "title", {
        set: () => {
          // Ignore requests to set the title
        },
      });
    } catch {
      // Ignore errors defining document.title setter
    }
  }, []);
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

export const clsx = (classes: Record<string, boolean>): string =>
  Object.entries(classes)
    .filter(([, isActive]) => isActive)
    .map(([className]) => className)
    .join(" ");

export const label = (value: string): HTMLAttributes<HTMLElement> => ({
  "aria-label": value,
  title: value,
});

export const isYouTubeUrl = (url: string): boolean =>
  url.includes("youtube.com/") || url.includes("youtu.be/");

let WEBP_SUPPORT: boolean;

export const supportsWebP = (): boolean => {
  if (typeof WEBP_SUPPORT !== "undefined") return WEBP_SUPPORT;

  try {
    WEBP_SUPPORT = document
      .createElement("canvas")
      .toDataURL("image/webp", 0)
      .startsWith("data:image/webp");
  } catch {
    WEBP_SUPPORT = false;
  }

  return WEBP_SUPPORT;
};

export const isParsableUrl = (url: string): boolean => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};

export const isWebGLAvailable = typeof WebGLRenderingContext !== "undefined";

export const getGifJs = async (): Promise<GIF> => {
  const { default: GIFInstance } = await import("gif.js");

  return new GIFInstance({
    quality: 10,
    workerScript: "Program Files/gif.js/gif.worker.js",
    workers: Math.max(Math.floor(navigator.hardwareConcurrency / 4), 1),
  });
};
