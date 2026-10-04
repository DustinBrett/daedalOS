import { PEEK_MAX_WIDTH } from "utils/constants";
import { getHtmlToImage } from "utils/functions";
import { canvasRenderedAt } from "utils/readableCanvas";

export type LiveElement = HTMLCanvasElement | HTMLVideoElement;

type Rect = { height: number; left: number; top: number; width: number };

export type LivePlacement = {
  box: Rect;
  clip: Rect;
  element: LiveElement;
  fit: string;
};

// nodeName instead of instanceof, as iframe elements belong to another realm
export const isLiveElement = (node: Node): node is LiveElement =>
  node.nodeName === "CANVAS" || node.nodeName === "VIDEO";

const getSize = (element: LiveElement): [number, number] =>
  "videoWidth" in element
    ? [element.videoWidth, element.videoHeight]
    : [element.width, element.height];

const frameCopies = new WeakMap<
  HTMLCanvasElement,
  { canvas: HTMLCanvasElement; copiedAt: number }
>();

// WebGPU canvases are blank once a frame is shown, so their frames are copied
// as they render and the copy is drawn instead
const getLiveSource = (element: LiveElement): CanvasImageSource => {
  const renderedAt =
    "videoWidth" in element ? undefined : canvasRenderedAt(element);

  if (renderedAt === undefined) return element;

  let copy = frameCopies.get(element as HTMLCanvasElement);

  if (!copy) {
    copy = { canvas: document.createElement("canvas"), copiedAt: 0 };
    frameCopies.set(element as HTMLCanvasElement, copy);
  }

  if (renderedAt > copy.copiedAt) {
    const { canvas } = copy;
    const [width, height] = getSize(element);

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(element, 0, 0);
    copy.copiedAt = performance.now();
  }

  return copy.canvas;
};

export const drawPeek = (
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number
): boolean => {
  if (!sourceWidth || !sourceHeight) return false;

  const width = Math.round(
    Math.min(sourceWidth, PEEK_MAX_WIDTH * window.devicePixelRatio)
  );
  const height = Math.round((width / sourceWidth) * sourceHeight);

  if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
  }

  ctx.drawImage(source, 0, 0, width, height);

  return true;
};

export const drawLiveElement = (
  ctx: CanvasRenderingContext2D,
  element: LiveElement
): boolean => drawPeek(ctx, getLiveSource(element), ...getSize(element));

export const drawLivePlacement = (
  ctx: CanvasRenderingContext2D,
  { box, clip, element, fit }: LivePlacement
): void => {
  const [width, height] = getSize(element);

  if (!width || !height) return;

  const scale =
    fit === "cover"
      ? Math.max(box.width / width, box.height / height)
      : fit === "contain" || fit === "scale-down"
        ? Math.min(box.width / width, box.height / height)
        : 0;
  const drawWidth = scale ? width * scale : box.width;
  const drawHeight = scale ? height * scale : box.height;

  ctx.save();
  ctx.beginPath();
  ctx.rect(clip.left, clip.top, clip.width, clip.height);
  ctx.clip();
  ctx.drawImage(
    getLiveSource(element),
    box.left + (box.width - drawWidth) / 2,
    box.top + (box.height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
  ctx.restore();
};

export const getFrameDocuments = (root: Document | Element): Document[] =>
  [
    ...(root.nodeName === "IFRAME" ? [root] : root.querySelectorAll("iframe")),
  ].flatMap((frame) => {
    const { contentDocument } = frame as HTMLIFrameElement;

    return contentDocument
      ? [contentDocument, ...getFrameDocuments(contentDocument)]
      : [];
  });

const getTopRect = (element: Element): Rect => {
  let { height, left, top, width } = element.getBoundingClientRect();

  for (
    let frame = element.ownerDocument.defaultView?.frameElement;
    frame;
    frame = frame.ownerDocument.defaultView?.frameElement
  ) {
    const rect = frame.getBoundingClientRect();
    const scale = rect.width / ((frame as HTMLElement).offsetWidth || 1);

    left = rect.left + (frame.clientLeft + left) * scale;
    top = rect.top + (frame.clientTop + top) * scale;
    width *= scale;
    height *= scale;
  }

  return { height, left, top, width };
};

const intersect = (a: Rect, b: Rect): Rect => {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);

  return {
    height: Math.min(a.top + a.height, b.top + b.height) - top,
    left,
    top,
    width: Math.min(a.left + a.width, b.left + b.width) - left,
  };
};

const getParent = (element: Element): Element | null | undefined =>
  element.parentElement ||
  (element.parentNode as null | ShadowRoot)?.host ||
  element.ownerDocument.defaultView?.frameElement;

const isClipping = (element: Element): boolean => {
  if (element.nodeName === "IFRAME") return true;

  const { overflowX, overflowY } = window.getComputedStyle(element);

  return overflowX !== "visible" || overflowY !== "visible";
};

export const getLivePlacements = (
  root: Element,
  peekWidth: number
): LivePlacement[] => {
  const rootRect = getTopRect(root);
  const scale = peekWidth / rootRect.width;
  const toPeek = ({ height, left, top, width }: Rect): Rect => ({
    height: height * scale,
    left: (left - rootRect.left) * scale,
    top: (top - rootRect.top) * scale,
    width: width * scale,
  });

  return [root, root.shadowRoot, ...getFrameDocuments(root)]
    .flatMap((node) =>
      node ? [...node.querySelectorAll<LiveElement>("canvas, video")] : []
    )
    .flatMap((element) => {
      if (
        typeof element.checkVisibility === "function" &&
        !element.checkVisibility({
          opacityProperty: true,
          visibilityProperty: true,
        })
      ) {
        return [];
      }

      const box = getTopRect(element);
      let clip = intersect(box, rootRect);

      for (
        let parent = getParent(element);
        parent && parent !== root;
        parent = getParent(parent)
      ) {
        if (isClipping(parent)) clip = intersect(clip, getTopRect(parent));
      }

      return clip.width > 0 && clip.height > 0
        ? [
            {
              box: toPeek(box),
              clip: toPeek(clip),
              element,
              fit: window.getComputedStyle(element).objectFit,
            },
          ]
        : [];
    });
};

export const captureElement = async (
  element: HTMLElement
): Promise<HTMLCanvasElement | undefined> => {
  // skipMediaContent is a local html-to-image patch, as canvas & video are drawn live
  const options = {
    ...(element.clientWidth > PEEK_MAX_WIDTH && {
      canvasHeight: Math.round(
        (PEEK_MAX_WIDTH / element.clientWidth) * element.clientHeight
      ),
      canvasWidth: PEEK_MAX_WIDTH,
    }),
    filter: (node: HTMLElement) => !(node instanceof HTMLSourceElement),
    skipAutoScale: true,
    skipMediaContent: true,
    style: { inset: "0" },
  };

  try {
    return await (await getHtmlToImage())?.toCanvas(element, options);
  } catch {
    return undefined;
  }
};
