import { basename, dirname, extname, join } from "path";
import { type Position } from "eruda";
import type HtmlToImage from "html-to-image";
import { type DragPosition } from "components/system/Files/FileManager/useDraggableEntries";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { type Processes, type RelativePosition } from "contexts/process/types";
import {
  type IconPosition,
  type IconPositions,
  type SortOrders,
} from "contexts/session/types";
import {
  DEFAULT_LOCALE,
  DESKTOP_PATH,
  HIGH_PRIORITY_REQUEST,
  ICON_CACHE,
  ICON_PATH,
  ICON_RES_MAP,
  MAX_ICON_SIZE,
  MAX_RES_ICON_OVERRIDE,
  MILLISECONDS_IN_SECOND,
  ONE_TIME_PASSIVE_EVENT,
  PACKAGE_DATA,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
  SUPPORTED_ICON_SIZES,
  TASKBAR_HEIGHT,
  TIMESTAMP_DATE_FORMAT,
  USER_ICON_PATH,
} from "utils/constants";

export const bufferToBlob = (buffer: Buffer, type?: string): Blob =>
  new Blob([buffer as BlobPart], type ? { type } : undefined);

export const bufferToUrl = (buffer: Buffer, mimeType?: string): string =>
  mimeType === "image/svg+xml"
    ? `data:${mimeType};base64,${window.btoa(buffer.toString())}`
    : URL.createObjectURL(bufferToBlob(buffer, mimeType));

const RESIZE_IMAGE_TIMEOUT_SECONDS = 60;

export const resizeImage = async (
  blob: Blob,
  maxDimension: number
): Promise<Blob> =>
  new Promise((resolve) => {
    const worker = new Worker(
      new URL("utils/resizeImage.worker", import.meta.url),
      { name: "Resize Image Worker" }
    );
    const timeoutHandle = setTimeout(() => {
      resolve(blob);
      worker.terminate();
    }, RESIZE_IMAGE_TIMEOUT_SECONDS * MILLISECONDS_IN_SECOND);
    const canvas = document
      .createElement("canvas")
      .transferControlToOffscreen();

    worker.addEventListener("message", ({ data }: { data: Blob }) => {
      clearTimeout(timeoutHandle);
      resolve(data instanceof Blob ? data : blob);
      worker.terminate();
    });
    worker.postMessage({ blob, canvas, maxDimension }, [canvas]);
  });

let dpi: number;

export const getDpi = (): number => {
  if (typeof dpi === "number") return dpi;

  dpi = Math.min(Math.ceil(window.devicePixelRatio), 3);

  return dpi;
};

export const getExtension = (url: string): string => {
  let ext = extname(url);

  if (!ext) {
    const baseName = basename(url);

    if (baseName.startsWith(".")) ext = baseName;
  }

  return ext.toLowerCase();
};

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
  else if (visibleWindows.length === 0) visibleWindows = allWindows;

  allWindows.forEach((pid) => {
    if (restoreWindows) {
      if (visibleWindows.includes(pid)) minimize(pid);
    } else if (!processes[pid]?.minimized) {
      visibleWindows.push(pid);
      minimize(pid);
    }
  });

  if (restoreWindows) {
    requestAnimationFrame(() =>
      processes[stackOrder[0]]?.componentWindow?.focus(PREVENT_SCROLL)
    );
  }
};

export const imageSrc = (
  imagePath: string,
  size: number,
  ratio: number,
  extension: string
): string => {
  const imageName = basename(imagePath, extension);
  const [expectedSize, maxIconSize] = MAX_RES_ICON_OVERRIDE[imageName] || [];
  const ratioSize = size * ratio;
  const imageSize = Math.min(
    MAX_ICON_SIZE,
    expectedSize === size ? Math.min(maxIconSize, ratioSize) : ratioSize
  );

  return `${join(
    dirname(imagePath),
    `${ICON_RES_MAP[imageSize] || imageSize}x${
      ICON_RES_MAP[imageSize] || imageSize
    }`,
    `${imageName}${extension}`
  ).replace(/\\/g, "/")}${ratio > 1 ? ` ${ratio}x` : ""}`;
};

export const imageSrcs = (
  imagePath: string,
  size: number,
  extension: string,
  failedUrls = [] as string[]
): string => {
  const srcs = [
    imageSrc(imagePath, size, 1, extension),
    imageSrc(imagePath, size, 2, extension),
    imageSrc(imagePath, size, 3, extension),
  ]
    .filter(
      (url) => failedUrls.length === 0 || failedUrls.includes(url.split(" ")[0])
    )
    .join(", ");

  return failedUrls?.includes(srcs) ? "" : srcs;
};

export const createFallbackSrcSet = (
  src: string,
  failedUrls: string[]
): string => {
  const srcExt = getExtension(src);
  const failedSizes = new Set(
    new Set(
      failedUrls.map((failedUrl) => {
        const fileName = basename(src, srcExt);

        return Number(
          failedUrl
            .replace(`${ICON_PATH}/`, "")
            .replace(`${USER_ICON_PATH}/`, "")
            .replace(`/${fileName}.png`, "")
            .replace(`/${fileName}.webp`, "")
            .split("x")[0]
        );
      })
    )
  );
  const possibleSizes = SUPPORTED_ICON_SIZES.filter(
    (size) => !failedSizes.has(size)
  );

  return possibleSizes
    .map((size) => imageSrc(src, size, 1, srcExt))
    .reverse()
    .join(", ");
};

export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(blob);
    fileReader.onloadend = () => resolve(fileReader.result as string);
  });

export const blobToBuffer = async (blob?: Blob | null): Promise<Buffer> =>
  blob ? Buffer.from(await blob.arrayBuffer()) : Buffer.from("");

export const fetchBlob = async (url: string): Promise<Blob> =>
  (await fetch(url)).blob();

export const canvasToBuffer = (canvas?: HTMLCanvasElement): Buffer =>
  Buffer.from(
    canvas?.toDataURL("image/png").replace("data:image/png;base64,", "") || "",
    "base64"
  );

export const imgDataToBuffer = (imageData: ImageData): Buffer => {
  const canvas = document.createElement("canvas");

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext("2d")?.putImageData(imageData, 0, 0);

  return canvasToBuffer(canvas);
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
  asModule?: boolean,
  contentWindow = window as Window
): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedScripts = [...contentWindow.document.scripts];
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

    const script = contentWindow.document.createElement("script");

    script.async = false;
    if (defer) script.defer = true;
    if (asModule) script.type = "module";
    script.fetchPriority = "high";
    script.src = src;
    script.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
    script.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

    contentWindow.document.head.append(script);
  });

const loadStyle = (
  href: string,
  contentWindow = window as Window
): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedStyles = [
      ...contentWindow.document.querySelectorAll("link[rel=stylesheet]"),
    ] as HTMLLinkElement[];

    if (loadedStyles.some((loadedStyle) => loadedStyle.href.endsWith(href))) {
      resolve(new Event("Already loaded."));
      return;
    }

    const link = contentWindow.document.createElement("link");

    link.rel = "stylesheet";
    link.fetchPriority = "high";
    link.href = href;
    link.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
    link.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

    contentWindow.document.head.append(link);
  });

export const loadFiles = async (
  files?: string[],
  defer?: boolean,
  force?: boolean,
  asModule?: boolean,
  contentWindow?: Window
): Promise<void> =>
  !files || files.length === 0
    ? Promise.resolve()
    : files.reduce(async (_promise, file) => {
        await (getExtension(file) === ".css"
          ? loadStyle(encodeURI(file), contentWindow)
          : loadScript(encodeURI(file), defer, force, asModule, contentWindow));
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
  { offsetHeight }: HTMLElement,
  { right = 0, left = 0, top = 0, bottom = 0 } = {} as RelativePosition,
  { width = 0, height = 0 } = {} as Size
): Position => {
  const [vh, vw] = [viewHeight(), viewWidth()];

  return {
    x: pxToNum(width) >= vw ? 0 : left || vw - right,
    y:
      pxToNum(height) + TASKBAR_HEIGHT >= vh
        ? 0
        : top || vh - bottom - offsetHeight,
  };
};

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

export const saveUnpositionedDesktopIcons = (
  setIconPositions: React.Dispatch<React.SetStateAction<IconPositions>>
): void => {
  const desktopIconGrid = document.querySelector<HTMLOListElement>("main > ol");

  if (desktopIconGrid instanceof HTMLOListElement) {
    const unPositionedIcons = [
      ...desktopIconGrid.querySelectorAll("li"),
    ].filter(
      ({ style: { gridRowStart, gridColumnStart } }) =>
        !gridRowStart || !gridColumnStart
    );

    if (unPositionedIcons.length > 0) {
      const {
        columnGap,
        gridTemplateColumns,
        gridTemplateRows,
        paddingTop,
        rowGap,
      } = window.getComputedStyle(desktopIconGrid);
      const [entryWidth] = gridTemplateColumns.split(" ");
      const [entryHeight] = gridTemplateRows.split(" ");
      const height = pxToNum(entryHeight) + pxToNum(rowGap);
      const width = pxToNum(entryWidth) + pxToNum(columnGap);
      const rowTopPadding = pxToNum(paddingTop);
      const newIconPositions = Object.fromEntries(
        unPositionedIcons.map((icon) => {
          const { top, left } = icon.getBoundingClientRect() || {};
          const button = icon.querySelector("button") as HTMLButtonElement;
          let name = button?.getAttribute("aria-label") || button?.textContent;

          if (button?.querySelector("img[src*=shortcut]")) {
            name = `${name}${SHORTCUT_EXTENSION}`;
          }

          return [
            name ? join(DESKTOP_PATH, name) : "",
            {
              gridColumnStart: Math.round(left / width) + 1,
              gridRowStart: Math.round((top - rowTopPadding) / height) + 1,
            },
          ];
        })
      );

      setIconPositions((currentIconPositions) => ({
        ...currentIconPositions,
        ...newIconPositions,
      }));
    }
  }
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
      let gridEntry: Element | undefined;

      try {
        gridEntry = [...gridElement.children].find((element) =>
          element.querySelector(
            `button[aria-label="${CSS.escape(entry.replace(SHORTCUT_EXTENSION, ""))}"]`
          )
        );
      } catch {
        // Ignore error getting element
      }

      if (gridEntry instanceof HTMLElement) {
        const { x, y, height, width } = gridEntry.getBoundingClientRect();

        newIconPositions[entryUrl] = calcGridDropPosition(gridElement, {
          x: x + width / 2,
          y: y + height / 2,
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

export const getIteratedNames = (
  fileEntries: string[],
  directory: string,
  iconPositions: IconPositions,
  exists: (path: string) => Promise<boolean>
): Promise<string[]> =>
  Promise.all(
    fileEntries.map(async (fileEntry) => {
      let entryIteration = `${directory}/${fileEntry}`;

      if (!iconPositions[entryIteration] || !(await exists(entryIteration))) {
        return fileEntry;
      }

      let iteration = 0;

      do {
        iteration += 1;
        entryIteration = `${directory}/${basename(
          fileEntry,
          extname(fileEntry)
        )} (${iteration})${extname(fileEntry)}`;
      } while (
        iconPositions[entryIteration] &&
        // eslint-disable-next-line no-await-in-loop
        (await exists(entryIteration))
      );

      return basename(entryIteration);
    })
  );

export const updateIconPositions = (
  directory: string,
  gridElement: HTMLElement | null,
  iconPositions: IconPositions,
  sortOrders: SortOrders,
  dragPosition: DragPosition,
  draggedEntries: string[],
  setIconPositions: React.Dispatch<React.SetStateAction<IconPositions>>,
  exists: (path: string) => Promise<boolean>
): void => {
  if (!gridElement || draggedEntries.length === 0) return;

  const updatedIconPositions = updateIconPositionsIfEmpty(
    directory,
    gridElement,
    iconPositions,
    sortOrders
  );
  const gridDropPosition = calcGridDropPosition(gridElement, dragPosition);
  const conflictingIcon = Object.entries(updatedIconPositions).find(
    ([, { gridColumnStart, gridRowStart }]) =>
      gridColumnStart === gridDropPosition.gridColumnStart &&
      gridRowStart === gridDropPosition.gridRowStart
  );
  const processIconMove = (): void => {
    const targetFile =
      draggedEntries.find((entry) =>
        entry.startsWith(document.activeElement?.textContent || "")
      ) || draggedEntries[0];
    const targetUrl = join(directory, targetFile);
    const adjustDraggedEntries = [
      targetFile,
      ...draggedEntries.filter((entry) => entry !== targetFile),
    ];
    const adjustIconPositions = Object.fromEntries(
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
                  updatedIconPositions,
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
    const newIconPositions = Object.fromEntries(
      Object.entries(adjustIconPositions).filter(
        ([entryFile, { gridColumnStart, gridRowStart }]) =>
          !Object.entries({
            ...updatedIconPositions,
            ...adjustIconPositions,
          }).some(
            ([
              compareEntryFile,
              {
                gridColumnStart: compareGridColumnStart,
                gridRowStart: compareGridRowStart,
              },
            ]) =>
              entryFile !== compareEntryFile &&
              gridColumnStart === compareGridColumnStart &&
              gridRowStart === compareGridRowStart
          )
      )
    );

    setIconPositions({ ...updatedIconPositions, ...newIconPositions });
  };

  if (conflictingIcon) {
    const [conflictingIconPath] = conflictingIcon;

    exists(conflictingIconPath).then((pathExists) => {
      if (!pathExists) {
        delete updatedIconPositions[conflictingIconPath];
        processIconMove();
      }
    });
  } else {
    processIconMove();
  }
};

export const isCanvasDrawn = (canvas?: HTMLCanvasElement | null): boolean => {
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  if (canvas.width === 0 || canvas.height === 0) return false;

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

const formatNumber = (number: number, roundUpNumber = false): string => {
  const formattedNumber = new Intl.NumberFormat(
    "en-US",
    roundUpNumber
      ? undefined
      : {
          maximumSignificantDigits: number < 1 ? 2 : 4,
          minimumSignificantDigits: number < 1 ? 2 : 3,
        }
  ).format(
    roundUpNumber ? Math.ceil(number) : Number(number.toFixed(4).slice(0, -2))
  );

  if (roundUpNumber) return formattedNumber;

  const [integer, decimal] = formattedNumber.split(".");

  if (integer.length === 3) return integer;
  if (integer.length === 2 && decimal.length === 2) {
    return `${integer}.${decimal[0]}`;
  }

  return formattedNumber;
};

export const getFormattedSize = (size = 0, asKB = false): string => {
  if (asKB) {
    if (size === 0) return "0 KB";
    if (size <= bytesInKB) return "1 KB";

    return `${formatNumber(size / bytesInKB, true)} KB`;
  }

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

let timezoneOffset: number;

export const getTZOffsetISOString = (timestamp?: number): string => {
  let time = timestamp;
  // eslint-disable-next-line no-undef-init
  let date: Date | undefined = undefined;

  if (!time) {
    date = new Date();
    time = date.getTime();
  }

  if (typeof timezoneOffset !== "number") {
    timezoneOffset = (date || new Date()).getTimezoneOffset() * 60000;
  }

  return new Date(time - timezoneOffset).toISOString();
};

export const LOCAL_HOST = new Set(["127.0.0.1", "localhost"]);
export const GOOGLE_SEARCH_QUERY = "https://www.google.com/search?igu=1&q=";

export const getUrlOrSearch = async (input: string): Promise<URL> => {
  const isIpfs = input.startsWith("ipfs://");
  const hasHttpSchema =
    input.startsWith("http://") || input.startsWith("https://");
  const hasTld =
    input.endsWith(".com") ||
    input.endsWith(".ca") ||
    input.endsWith(".net") ||
    input.endsWith(".org");
  const isLocalHost = LOCAL_HOST.has(input);

  try {
    const url = new URL(
      !isLocalHost && (hasHttpSchema || !hasTld || isIpfs)
        ? input
        : `https://${input}`
    );

    if (isIpfs) {
      const { getIpfsGatewayUrl } = await import("utils/ipfs");

      return new URL(await getIpfsGatewayUrl(url.href));
    }

    return url;
  } catch {
    return new URL(`${GOOGLE_SEARCH_QUERY}${input}`);
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

  IS_SAFARI = /^(?:(?!chrome|android).)*safari/i.test(
    window.navigator.userAgent
  );

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
    if (event?.cancelable) {
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
  (url.includes("youtube.com/") || url.includes("youtu.be/")) &&
  !url.includes("youtube.com/@") &&
  !url.includes("/channel/") &&
  !url.includes("/c/");

export const getYouTubeUrlId = (url: string): string => {
  try {
    const { pathname, searchParams } = new URL(url);

    return searchParams.get("v") || pathname.split("/").pop() || "";
  } catch {
    // URL parsing failed
  }

  return "";
};

export const getMimeType = (url: string, ext?: string): string => {
  switch (ext ? ext.toLowerCase() : getExtension(url)) {
    case ".ani":
    case ".cur":
    case ".ico":
      return "image/vnd.microsoft.icon";
    case ".flac":
      return "audio/x-flac";
    case ".cache":
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".json":
      return "application/json";
    case ".html":
    case ".htm":
    case ".whtml":
      return "text/html";
    case ".m3u":
    case ".m3u8":
      return "application/x-mpegURL";
    case ".m4a":
      return "audio/m4a";
    case ".m4v":
    case ".mkv":
    case ".mov":
    case ".mp4":
      return "video/mp4";
    case ".mp3":
      return "audio/mpeg";
    case ".oga":
      return "audio/ogg";
    case ".ogg":
    case ".ogm":
    case ".ogv":
      return "video/ogg";
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".md":
    case ".txt":
      return "text/plain";
    case ".wav":
      return "audio/wav";
    case ".webm":
      return "video/webm";
    case ".webp":
      return "image/webp";
    case ".xml":
      return "application/xml";
    case ".jsdos":
    case ".pk3":
    case ".wsz":
    case ".zip":
      return "application/zip";
    default:
      return "";
  }
};

export const isDynamicIcon = (icon?: string): boolean =>
  typeof icon === "string" &&
  (icon.startsWith(ICON_PATH) ||
    (icon.startsWith(USER_ICON_PATH) && !icon.startsWith(ICON_CACHE)));

const getPreloadedLinks = (): HTMLLinkElement[] => [
  ...document.querySelectorAll<HTMLLinkElement>("link[rel=preload]"),
];

let HAS_MODULE_PRELOAD_SUPPORT = false;

const supportsModulePreload = (): boolean => {
  if (HAS_MODULE_PRELOAD_SUPPORT) return true;

  try {
    const { relList } = document.createElement("link");

    HAS_MODULE_PRELOAD_SUPPORT = relList
      ? relList.supports("modulepreload")
      : false;
  } catch {
    // Ignore failure to check for modulepreload support
  }

  return HAS_MODULE_PRELOAD_SUPPORT;
};

let HAS_WEBP_SUPPORT = false;

export const supportsWebp = (): boolean => {
  if (HAS_WEBP_SUPPORT) return true;

  try {
    HAS_WEBP_SUPPORT = document
      .createElement("canvas")
      .toDataURL("image/webp")
      .startsWith("data:image/webp");
  } catch {
    // Ignore failure to check for WebP support
  }

  return HAS_WEBP_SUPPORT;
};

const supportsImageSrcSet = (): boolean =>
  Object.prototype.hasOwnProperty.call(
    HTMLLinkElement.prototype,
    "imageSrcset"
  );

export const preloadImage = (
  image: string,
  id?: string,
  fetchPriority: "auto" | "high" | "low" = "high"
): void => {
  const extension = getExtension(image);
  const link = document.createElement("link");

  link.as = "image";
  if (id) link.id = id;
  link.fetchPriority = fetchPriority;
  link.rel = "preload";
  link.type = getMimeType(extension);

  if (isDynamicIcon(image)) {
    if (supportsImageSrcSet()) {
      link.imageSrcset = imageSrcs(image, 48, extension);
    } else {
      const [href] = imageSrc(image, 48, getDpi(), extension).split(" ");

      link.href = href;
    }
  } else {
    link.href = image;
  }

  const preloadedLinks = getPreloadedLinks();

  if (
    !preloadedLinks.some(
      (preloadedLink) =>
        (link.imageSrcset &&
          preloadedLink?.imageSrcset?.endsWith(link.imageSrcset)) ||
        (link.href && preloadedLink?.href?.endsWith(link.href))
    )
  ) {
    document.head.append(link);
  }
};

export const preloadLibs = (libs: string[] = []): void => {
  const scripts = [...document.scripts];
  const preloadedLinks = getPreloadedLinks();

  // eslint-disable-next-line unicorn/no-array-callback-reference
  libs.map(encodeURI).forEach((lib) => {
    if (
      scripts.some((script) => script.src.endsWith(lib)) ||
      preloadedLinks.some((preloadedLink) => preloadedLink.href.endsWith(lib))
    ) {
      return;
    }

    const link = document.createElement("link");

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
      case ".js":
        if (supportsModulePreload()) {
          link.rel = "modulepreload";
        }
        break;
      case ".json":
      case ".wasm":
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

type GIFWithWorkers = GIF & { freeWorkers: Worker[] };

export const getGifJs = async (): Promise<GIFWithWorkers> => {
  const { default: GIFInstance } = await import("gif.js");

  return new GIFInstance({
    quality: 10,
    workerScript: "System/gif.js/gif.worker.js",
    workers: Math.max(Math.floor(navigator.hardwareConcurrency / 4), 1),
  }) as GIFWithWorkers;
};

export const jsonFetch = async <T extends Record<string, unknown>>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(url, { ...HIGH_PRIORITY_REQUEST, ...options });
  const json = (await response.json()) as T;

  return json || {};
};

export const generatePrettyTimestamp = (): string =>
  new Intl.DateTimeFormat(DEFAULT_LOCALE, TIMESTAMP_DATE_FORMAT)
    .format(new Date())
    .replace(/[/:]/g, "-")
    .replace(",", "");

export const isFileSystemMappingSupported = (): boolean =>
  typeof FileSystemHandle === "function" && "showDirectoryPicker" in window;

export const hasFinePointer = (): boolean =>
  window.matchMedia("(pointer: fine)").matches;

export const isBeforeBg = (): boolean =>
  document.documentElement.style.getPropertyValue(
    "--before-background-opacity"
  ) === "1";

export const parseBgPosition = (position?: string): `${number}%` | "center" => {
  if (typeof position === "string") {
    const positionNum = Number.parseFloat(position);

    if (!Number.isNaN(positionNum) && positionNum >= 0 && positionNum <= 100) {
      return `${positionNum}%`;
    }
  }

  return "center";
};

export const toSorted = <T>(
  array: T[],
  compareFn?: (a: T, b: T) => number
): T[] => [...array].sort(compareFn);

export const notFound = (resource: string): void =>
  // eslint-disable-next-line no-alert
  alert(`Can't find '${resource}'. Check the spelling and try again.`);

export const shouldCaptureDragImage = (
  entryCount: number,
  isDesktop = false
): boolean => entryCount > 1 || (!isDesktop && entryCount === 1 && isSafari());

export const maybeRequestIdleCallback = (
  callback: () => void | Promise<void>
): void => {
  if (
    "requestIdleCallback" in window &&
    typeof window.requestIdleCallback === "function"
  ) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0);
  }
};

export const displayVersion = (): string => {
  const { __NEXT_DATA__: { buildId } = {} } = window;

  return `${PACKAGE_DATA.version}${buildId ? `-${buildId}` : ""}`;
};

export const isDev = (): boolean => "__nextDevClientId" in window;
