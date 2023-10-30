import type { DragPosition } from "components/system/Files/FileManager/useDraggableEntries";
import type { Size } from "components/system/Window/RndWindow/useResizable";
import type { Processes, RelativePosition } from "contexts/process/types";
import type {
  IconPosition,
  IconPositions,
  SortOrders,
} from "contexts/session/types";
import type { Position } from "eruda";
import type HtmlToImage from "html-to-image";
import { basename, dirname, extname, join } from "path";
import {
  DEFAULT_LOCALE,
  HIGH_PRIORITY_REQUEST,
  MAX_RES_ICON_OVERRIDE,
  ONE_TIME_PASSIVE_EVENT,
  SMALLEST_JXL_FILE,
  TASKBAR_HEIGHT,
  TIMESTAMP_DATE_FORMAT,
} from "utils/constants";

export const GOOGLE_SEARCH_QUERY = "https://www.google.com/search?igu=1&q=";

export const bufferToBlob = (buffer: Buffer, type?: string): Blob =>
  new Blob([buffer], type ? { type } : undefined);

export const bufferToUrl = (buffer: Buffer, mimeType?: string): string =>
  mimeType
    ? `data:${mimeType};base64,${buffer.toString("base64")}`
    : URL.createObjectURL(bufferToBlob(buffer));

let dpi: number;

export const getDpi = (): number => {
  if (typeof dpi === "number") return dpi;

  dpi = Math.min(Math.ceil(window.devicePixelRatio), 3);

  return dpi;
};

export const getExtension = (url: string): string => extname(url).toLowerCase();

export const sendMouseClick = (target: HTMLElement, count = 1): void => {
  if (count === 0) return;

  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  sendMouseClick(target, count - 1);
};

let visibleWindows: string[] = [];

export const toggleShowDesktop = (
  processes: Processes,
  stackOrder: string[],
  minimize: (id: string) => void
): void => {
  const restoreWindows =
    stackOrder.length > 0 &&
    !stackOrder.some((pid) => !processes[pid]?.minimized);
  const allWindows = restoreWindows ? [...stackOrder].reverse() : stackOrder;

  if (!restoreWindows) visibleWindows = [];

  allWindows.forEach((pid) => {
    if (restoreWindows) {
      if (visibleWindows.includes(pid)) minimize(pid);
    } else if (!processes[pid]?.minimized) {
      visibleWindows.push(pid);
      minimize(pid);
    }
  });

  if (restoreWindows) {
    requestAnimationFrame(
      () => processes[stackOrder[0]]?.componentWindow?.focus()
    );
  }
};

export const imageSrc = (
  imagePath: string,
  size: number,
  ratio: number,
  extension: string
): string => {
  const imageName = basename(imagePath, ".webp");
  const [expectedSize, maxIconSize] = MAX_RES_ICON_OVERRIDE[imageName] || [];
  const ratioSize = size * ratio;
  const imageSize =
    expectedSize === size ? Math.min(maxIconSize, ratioSize) : ratioSize;
  const isCachedIcon = extname(imageName) === ".cache";

  return `${join(
    dirname(imagePath),
    isCachedIcon ? "" : `${imageSize}x${imageSize}`,
    `${imageName}${isCachedIcon ? "" : extension}`
  ).replace(/\\/g, "/")}${ratio > 1 ? ` ${ratio}x` : ""}`;
};

export const imageSrcs = (
  imagePath: string,
  size: number,
  extension: string,
  failedUrls?: string[]
): string => {
  return [
    imageSrc(imagePath, size, 1, extension),
    imageSrc(imagePath, size, 2, extension),
    imageSrc(imagePath, size, 3, extension),
  ]
    .filter(
      (url) => !failedUrls?.length || failedUrls?.includes(url.split(" ")[0])
    )
    .join(", ");
};

export const imageToBufferUrl = (
  path: string,
  buffer: Buffer | string
): string =>
  getExtension(path) === ".svg"
    ? `data:image/svg+xml;base64,${window.btoa(buffer.toString())}`
    : `data:image/png;base64,${buffer.toString("base64")}`;

export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(blob);
    fileReader.onloadend = () => resolve(fileReader.result as string);
  });

export const hasJxlSupport = (): Promise<boolean> =>
  new Promise((resolve) => {
    const JXL = new Image();

    JXL.src = SMALLEST_JXL_FILE;

    JXL.addEventListener("load", () => resolve(true));
    JXL.addEventListener("error", () => resolve(false));
  });

type JxlDecodeResponse = { data: { imgData: ImageData } };

export const decodeJxl = async (image: Buffer): Promise<ImageData> =>
  new Promise((resolve) => {
    const worker = new Worker("System/JXL.js/jxl_dec.js");

    worker.postMessage({ image, jxlSrc: "image.jxl" });
    worker.addEventListener("message", (message: JxlDecodeResponse) =>
      resolve(message?.data?.imgData)
    );
  });

export const imgDataToBuffer = (imageData: ImageData): Buffer => {
  const canvas = document.createElement("canvas");

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext("2d")?.putImageData(imageData, 0, 0);

  return Buffer.from(
    canvas?.toDataURL("image/png").replace("data:image/png;base64,", ""),
    "base64"
  );
};

export const cleanUpBufferUrl = (url: string): void => URL.revokeObjectURL(url);

const rowBlank = (imageData: ImageData, width: number, y: number): boolean => {
  for (let x = 0; x < width; ++x) {
    if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
  }
  return true;
};

const columnBlank = (
  imageData: ImageData,
  width: number,
  x: number,
  top: number,
  bottom: number
): boolean => {
  for (let y = top; y < bottom; ++y) {
    if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
  }
  return true;
};

export const trimCanvasToTopLeft = (
  canvas: HTMLCanvasElement
): HTMLCanvasElement => {
  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true,
    willReadFrequently: true,
  });

  if (!ctx) return canvas;

  const { height, ownerDocument, width } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { height: bottom, width: right } = imageData;

  let top = 0;
  let left = 0;

  while (top < bottom && rowBlank(imageData, width, top)) ++top;
  while (left < right && columnBlank(imageData, width, left, top, bottom)) {
    ++left;
  }

  const trimmed = ctx.getImageData(left, top, right - left, bottom - top);
  const copy = ownerDocument.createElement("canvas");
  const copyCtx = copy.getContext("2d");

  if (!copyCtx) return canvas;

  copy.width = trimmed.width;
  copy.height = trimmed.height;
  copyCtx.putImageData(trimmed, 0, 0);

  return copy;
};

const loadScript = (
  src: string,
  defer?: boolean,
  force?: boolean,
  asModule?: boolean
): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedScripts = [...document.scripts];
    const currentScript = loadedScripts.find((loadedScript) =>
      loadedScript.src.endsWith(src)
    );

    if (currentScript) {
      if (!force) {
        resolve(new Event("Already loaded."));
        return;
      }

      currentScript.remove();
    }

    const script = document.createElement(
      "script"
    ) as HTMLElementWithPriority<HTMLScriptElement>;

    script.async = false;
    if (defer) script.defer = true;
    if (asModule) script.type = "module";
    script.fetchPriority = "high";
    script.src = src;
    script.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
    script.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

    document.head.append(script);
  });

const loadStyle = (href: string): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedStyles = [
      ...document.querySelectorAll("link[rel=stylesheet]"),
    ] as HTMLLinkElement[];

    if (loadedStyles.some((loadedStyle) => loadedStyle.href.endsWith(href))) {
      resolve(new Event("Already loaded."));
      return;
    }

    const link = document.createElement(
      "link"
    ) as HTMLElementWithPriority<HTMLLinkElement>;

    link.rel = "stylesheet";
    link.fetchPriority = "high";
    link.href = href;
    link.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
    link.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

    document.head.append(link);
  });

export const loadFiles = async (
  files?: string[],
  defer?: boolean,
  force?: boolean,
  asModule?: boolean
): Promise<void> =>
  !files || files.length === 0
    ? Promise.resolve()
    : files.reduce(async (_promise, file) => {
        await (getExtension(file) === ".css"
          ? loadStyle(encodeURI(file))
          : loadScript(encodeURI(file), defer, force, asModule));
      }, Promise.resolve());

export const getHtmlToImage = async (): Promise<
  typeof HtmlToImage | undefined
> => {
  await loadFiles(["/System/html-to-image/html-to-image.js"]);

  const { htmlToImage } = window as unknown as Window & {
    htmlToImage: typeof HtmlToImage;
  };

  return htmlToImage;
};

export const pxToNum = (value: number | string = 0): number =>
  typeof value === "number" ? value : Number.parseFloat(value);

export const viewHeight = (): number => window.innerHeight;

export const viewWidth = (): number => window.innerWidth;

export const getWindowViewport = (): Position => ({
  x: viewWidth(),
  y: viewHeight() - TASKBAR_HEIGHT,
});

export const calcInitialPosition = (
  relativePosition: RelativePosition,
  container: HTMLElement
): Position => ({
  x: relativePosition.left || viewWidth() - (relativePosition.right || 0),
  y:
    relativePosition.top ||
    viewHeight() - (relativePosition.bottom || 0) - container.offsetHeight,
});

const GRID_TEMPLATE_ROWS = "grid-template-rows";

const calcGridDropPosition = (
  gridElement: HTMLElement | null,
  { x = 0, y = 0 }: DragPosition
): IconPosition => {
  if (!gridElement) return Object.create(null) as IconPosition;

  const gridComputedStyle = window.getComputedStyle(gridElement);
  const gridTemplateRows = gridComputedStyle
    .getPropertyValue(GRID_TEMPLATE_ROWS)
    .split(" ");
  const gridTemplateColumns = gridComputedStyle
    .getPropertyValue("grid-template-columns")
    .split(" ");
  const gridRowHeight = pxToNum(gridTemplateRows[0]);
  const gridColumnWidth = pxToNum(gridTemplateColumns[0]);
  const gridColumnGap = pxToNum(
    gridComputedStyle.getPropertyValue("grid-column-gap")
  );
  const gridRowGap = pxToNum(
    gridComputedStyle.getPropertyValue("grid-row-gap")
  );
  const paddingTop = pxToNum(gridComputedStyle.getPropertyValue("padding-top"));

  return {
    gridColumnStart: Math.min(
      Math.ceil(x / (gridColumnWidth + gridColumnGap)),
      gridTemplateColumns.length
    ),
    gridRowStart: Math.min(
      Math.ceil((y - paddingTop) / (gridRowHeight + gridRowGap)),
      gridTemplateRows.length
    ),
  };
};

export const updateIconPositionsIfEmpty = (
  url: string,
  gridElement: HTMLElement | null,
  iconPositions: IconPositions,
  sortOrders: SortOrders
): IconPositions => {
  if (!gridElement) return iconPositions;

  const [fileOrder = []] = sortOrders[url] || [];
  const newIconPositions: IconPositions = {};
  const gridComputedStyle = window.getComputedStyle(gridElement);
  const gridTemplateRowCount = gridComputedStyle
    .getPropertyValue(GRID_TEMPLATE_ROWS)
    .split(" ").length;

  fileOrder.forEach((entry, index) => {
    const entryUrl = join(url, entry);

    if (!iconPositions[entryUrl]) {
      const gridEntry = [...gridElement.children].find((element) =>
        element.querySelector(`button[aria-label="${entry}"]`)
      );

      if (gridEntry instanceof HTMLElement) {
        const { x, y, height, width } = gridEntry.getBoundingClientRect();

        newIconPositions[entryUrl] = calcGridDropPosition(gridElement, {
          x: x - width,
          y: y + height,
        });
      } else {
        const position = index + 1;
        const gridColumnStart = Math.ceil(position / gridTemplateRowCount);
        const gridRowStart =
          position - gridTemplateRowCount * (gridColumnStart - 1);

        newIconPositions[entryUrl] = { gridColumnStart, gridRowStart };
      }
    }
  });

  return Object.keys(newIconPositions).length > 0
    ? { ...newIconPositions, ...iconPositions }
    : iconPositions;
};

const calcGridPositionOffset = (
  url: string,
  targetUrl: string,
  currentIconPositions: IconPositions,
  gridDropPosition: IconPosition,
  [, ...draggedEntries]: string[],
  gridElement: HTMLElement
): IconPosition => {
  if (currentIconPositions[url] && currentIconPositions[targetUrl]) {
    return {
      gridColumnStart:
        currentIconPositions[url].gridColumnStart +
        (gridDropPosition.gridColumnStart -
          currentIconPositions[targetUrl].gridColumnStart),
      gridRowStart:
        currentIconPositions[url].gridRowStart +
        (gridDropPosition.gridRowStart -
          currentIconPositions[targetUrl].gridRowStart),
    };
  }

  const gridComputedStyle = window.getComputedStyle(gridElement);
  const gridTemplateRowCount = gridComputedStyle
    .getPropertyValue(GRID_TEMPLATE_ROWS)
    .split(" ").length;
  const {
    gridColumnStart: targetGridColumnStart,
    gridRowStart: targetGridRowStart,
  } = gridDropPosition;
  const gridRowStart =
    targetGridRowStart + draggedEntries.indexOf(basename(url)) + 1;

  return gridRowStart > gridTemplateRowCount
    ? {
        gridColumnStart:
          targetGridColumnStart +
          Math.ceil(gridRowStart / gridTemplateRowCount) -
          1,
        gridRowStart:
          gridRowStart % gridTemplateRowCount || gridTemplateRowCount,
      }
    : {
        gridColumnStart: targetGridColumnStart,
        gridRowStart,
      };
};

export const updateIconPositions = (
  directory: string,
  gridElement: HTMLElement | null,
  iconPositions: IconPositions,
  sortOrders: SortOrders,
  dragPosition: DragPosition,
  draggedEntries: string[],
  setIconPositions: React.Dispatch<React.SetStateAction<IconPositions>>
): void => {
  if (!gridElement) return;

  const currentIconPositions = updateIconPositionsIfEmpty(
    directory,
    gridElement,
    iconPositions,
    sortOrders
  );
  const gridDropPosition = calcGridDropPosition(gridElement, dragPosition);

  if (
    draggedEntries.length > 0 &&
    !Object.values(currentIconPositions).some(
      ({ gridColumnStart, gridRowStart }) =>
        gridColumnStart === gridDropPosition.gridColumnStart &&
        gridRowStart === gridDropPosition.gridRowStart
    )
  ) {
    const targetFile =
      draggedEntries.find((entry) =>
        entry.startsWith(document.activeElement?.textContent || "")
      ) || draggedEntries[0];
    const targetUrl = join(directory, targetFile);
    const adjustDraggedEntries = [
      targetFile,
      ...draggedEntries.filter((entry) => entry !== targetFile),
    ];
    const newIconPositions = Object.fromEntries(
      adjustDraggedEntries
        .map<[string, IconPosition]>((entryFile) => {
          const url = join(directory, entryFile);

          return [
            url,
            url === targetUrl
              ? gridDropPosition
              : calcGridPositionOffset(
                  url,
                  targetUrl,
                  currentIconPositions,
                  gridDropPosition,
                  adjustDraggedEntries,
                  gridElement
                ),
          ];
        })
        .filter(
          ([, { gridColumnStart, gridRowStart }]) =>
            gridColumnStart >= 1 && gridRowStart >= 1
        )
    );

    setIconPositions({
      ...currentIconPositions,
      ...Object.fromEntries(
        Object.entries(newIconPositions).filter(
          ([, { gridColumnStart, gridRowStart }]) =>
            !Object.values(currentIconPositions).some(
              ({
                gridColumnStart: currentGridColumnStart,
                gridRowStart: currentRowColumnStart,
              }) =>
                gridColumnStart === currentGridColumnStart &&
                gridRowStart === currentRowColumnStart
            )
        )
      ),
    });
  }
};

export const isCanvasDrawn = (canvas?: HTMLCanvasElement | null): boolean => {
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const { data: pixels = [] } =
    canvas
      .getContext("2d", { willReadFrequently: true })
      ?.getImageData(0, 0, canvas.width, canvas.height) || {};

  if (pixels.length === 0) return false;

  const bwPixels: Record<number, number> = { 0: 0, 255: 0 };

  for (const pixel of pixels) {
    if (pixel !== 0 && pixel !== 255) return true;

    bwPixels[pixel] += 1;
  }

  const isBlankCanvas =
    bwPixels[0] === pixels.length ||
    bwPixels[255] === pixels.length ||
    (bwPixels[255] + bwPixels[0] === pixels.length &&
      bwPixels[0] / 3 === bwPixels[255]);

  return !isBlankCanvas;
};

const bytesInKB = 1024;
const bytesInMB = 1022976; // 1024 * 999
const bytesInGB = 1047527424; // 1024 * 1024 * 999
const bytesInTB = 1072668082176; // 1024 * 1024 * 1024 * 999

const formatNumber = (number: number): string => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: number < 1 ? 2 : 4,
    minimumSignificantDigits: number < 1 ? 2 : 3,
  }).format(Number(number.toFixed(4).slice(0, -2)));

  const [integer, decimal] = formattedNumber.split(".");

  if (integer.length === 3) return integer;
  if (integer.length === 2 && decimal.length === 2) {
    return `${integer}.${decimal[0]}`;
  }

  return formattedNumber;
};

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

export const getTZOffsetISOString = (): string => {
  const date = new Date();

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString();
};

export const getUrlOrSearch = async (input: string): Promise<string> => {
  const isIpfs = input.startsWith("ipfs://");
  const hasHttpSchema =
    input.startsWith("http://") || input.startsWith("https://");
  const hasTld =
    input.endsWith(".com") ||
    input.endsWith(".ca") ||
    input.endsWith(".net") ||
    input.endsWith(".org");

  try {
    const { href } = new URL(
      hasHttpSchema || !hasTld || isIpfs ? input : `https://${input}`
    );

    if (isIpfs) {
      const { getIpfsGatewayUrl } = await import("utils/ipfs");

      return await getIpfsGatewayUrl(href);
    }

    return href;
  } catch {
    return `${GOOGLE_SEARCH_QUERY}${input}`;
  }
};

let IS_FIREFOX: boolean;

export const isFirefox = (): boolean => {
  if (typeof window === "undefined") return false;
  if (IS_FIREFOX ?? false) return IS_FIREFOX;

  IS_FIREFOX = /firefox/i.test(window.navigator.userAgent);

  return IS_FIREFOX;
};

let IS_SAFARI: boolean;

export const isSafari = (): boolean => {
  if (typeof window === "undefined") return false;
  if (IS_SAFARI ?? false) return IS_SAFARI;

  IS_SAFARI = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

  return IS_SAFARI;
};

export const haltEvent = (
  event:
    | Event
    | React.DragEvent
    | React.FocusEvent
    | React.KeyboardEvent
    | React.MouseEvent
): void => {
  try {
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
  } catch {
    // Ignore failured to halt event
  }
};

export const createOffscreenCanvas = (
  containerElement: HTMLElement,
  devicePixelRatio = 1,
  customSize: Size = Object.create(null) as Size
): OffscreenCanvas => {
  const canvas = document.createElement("canvas");
  const height = Number(customSize?.height) || containerElement.offsetHeight;
  const width = Number(customSize?.width) || containerElement.offsetWidth;

  canvas.style.height = `${height}px`;
  canvas.style.width = `${width}px`;

  canvas.height = Math.floor(height * devicePixelRatio);
  canvas.width = Math.floor(width * devicePixelRatio);

  containerElement.append(canvas);

  return canvas.transferControlToOffscreen();
};

export const getSearchParam = (param: string): string =>
  new URLSearchParams(window.location.search).get(param) || "";

export const clsx = (classes: Record<string, boolean>): string =>
  Object.entries(classes)
    .filter(([, isActive]) => isActive)
    .map(([className]) => className)
    .join(" ");

export const label = (value: string): React.HTMLAttributes<HTMLElement> => ({
  "aria-label": value,
  title: value,
});

export const isYouTubeUrl = (url: string): boolean =>
  url.includes("youtube.com/") || url.includes("youtu.be/");

export const getYouTubeUrlId = (url: string): string => {
  try {
    const { pathname, searchParams } = new URL(url);

    return searchParams.get("v") || pathname.split("/").pop() || "";
  } catch {
    // URL parsing failed
  }

  return "";
};

export const preloadLibs = (libs: string[] = []): void => {
  const scripts = [...document.scripts];
  const preloadedLinks = [
    ...document.querySelectorAll("link[rel=preload]"),
  ] as HTMLLinkElement[];

  // eslint-disable-next-line unicorn/no-array-callback-reference
  libs.map(encodeURI).forEach((lib) => {
    if (
      scripts.some((script) => script.src.endsWith(lib)) ||
      preloadedLinks.some((preloadedLink) => preloadedLink.href.endsWith(lib))
    ) {
      return;
    }

    const link = document.createElement(
      "link"
    ) as HTMLElementWithPriority<HTMLLinkElement>;

    link.fetchPriority = "high";
    link.rel = "preload";
    link.href = lib;

    switch (getExtension(lib)) {
      case ".css":
        link.as = "style";
        break;
      case ".htm":
      case ".html":
        link.rel = "prerender";
        break;
      case ".url":
        link.as = "fetch";
        link.crossOrigin = "anonymous";
        break;
      default:
        link.as = "script";
        break;
    }

    document.head.append(link);
  });
};

export const getGifJs = async (): Promise<GIF> => {
  const { default: GIFInstance } = await import("gif.js");

  return new GIFInstance({
    quality: 10,
    workerScript: "Program Files/gif.js/gif.worker.js",
    workers: Math.max(Math.floor(navigator.hardwareConcurrency / 4), 1),
  });
};

export const jsonFetch = async (
  url: string
): Promise<Record<string, unknown>> => {
  const response = await fetch(url, HIGH_PRIORITY_REQUEST);
  const json = (await response.json()) as Record<string, unknown>;

  return json || {};
};

export const generatePrettyTimestamp = (): string =>
  new Intl.DateTimeFormat(DEFAULT_LOCALE, TIMESTAMP_DATE_FORMAT)
    .format(new Date())
    .replace(/[/:]/g, "-")
    .replace(",", "");

export const isFileSystemMappingSupported = (): boolean =>
  typeof FileSystemHandle === "function" && "showDirectoryPicker" in window;
