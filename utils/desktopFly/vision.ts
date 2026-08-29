// What the fly is looking at: the desktop as seen from a fly's position.
//
// Two senses live here. Object vision identifies the thing under or ahead of
// the fly — a desktop icon (by name), a window (by title), a wandering eSheep,
// the taskbar, or bare wallpaper — via `elementsFromPoint`, giving each a
// stable identity the fly's memory can habituate to. Light vision keeps a
// tiny downsampled snapshot of the actual wallpaper pixels (canvas, video, or
// image), so a fly can compare brightness ahead-left against ahead-right and
// steer — Drosophila's positive phototaxis, inverted when sleepy.

const SHEEP_IMG_SELECTOR =
  "main > div[style*='z-index: 2000'] > img[src^='data:image']";

/** Downsampled wallpaper snapshot resolution. */
const EYE_COLS = 48;
const EYE_ROWS = 27;

type SeenKind =
  | "icon"
  | "sheep"
  | "taskbar"
  | "wallpaper"
  | "webamp"
  | "window";

/** One identified thing in the fly's view, in client coordinates. */
type Seen = {
  key: string;
  kind: SeenKind;
  label: string;
  rect: DOMRect;
};

/** A sheep's box in client coordinates, with a stable identity. */
type SheepRect = {
  id: number;
  rect: DOMRect;
};

// Stable identities for DOM objects across polls, shared by every fly.
const elementIds = new WeakMap<Element, number>();
let nextElementId = 1;

const idFor = (element: Element): number => {
  let id = elementIds.get(element);

  if (id === undefined) {
    id = nextElementId;
    nextElementId += 1;
    elementIds.set(element, id);
  }

  return id;
};

/**
 * Sheep get ids far above any window id from the terrain sense, so the two
 * id spaces never collide inside the shared moving-object list.
 */
export const SHEEP_ID_BASE = 1_000_000;

export const senseSheep = (): SheepRect[] =>
  [...document.querySelectorAll(SHEEP_IMG_SELECTOR)].reduce<SheepRect[]>(
    (sheep, img) => {
      const box = img.parentElement;

      if (box) {
        sheep.push({
          id: SHEEP_ID_BASE + idFor(box),
          rect: box.getBoundingClientRect(),
        });
      }

      return sheep;
    },
    []
  );

/** Identify the topmost interesting thing at a client point. */
export const classifyPoint = (
  clientX: number,
  clientY: number
): Seen | undefined => {
  if (
    clientX < 0 ||
    clientY < 0 ||
    clientX >= window.innerWidth ||
    clientY >= window.innerHeight
  ) {
    return undefined;
  }

  const elements = document.elementsFromPoint(clientX, clientY);

  for (const element of elements) {
    const icon = element.closest("main > ol > li");

    if (icon) {
      const label =
        icon.querySelector("button")?.getAttribute("aria-label") ||
        icon.textContent?.trim() ||
        "icon";

      return {
        key: `icon-${idFor(icon)}`,
        kind: "icon",
        label,
        rect: icon.getBoundingClientRect(),
      };
    }

    if (
      element instanceof HTMLImageElement &&
      element.src.startsWith("data:image") &&
      element.parentElement?.parentElement instanceof HTMLElement &&
      element.parentElement.parentElement.tagName === "MAIN"
    ) {
      const box = element.parentElement;

      return {
        key: `sheep-${idFor(box)}`,
        kind: "sheep",
        label: "sheep",
        rect: box.getBoundingClientRect(),
      };
    }

    const windowEl = element.closest("main .react-draggable");

    if (windowEl) {
      const label =
        windowEl.querySelector("header figcaption")?.textContent?.trim() ||
        windowEl.querySelector("figcaption")?.textContent?.trim() ||
        "window";

      return {
        key: `window-${idFor(windowEl)}`,
        kind: "window",
        label,
        rect: windowEl.getBoundingClientRect(),
      };
    }

    if (element.closest("#webamp")) {
      return {
        key: "webamp",
        kind: "webamp",
        label: "Webamp",
        rect: element.getBoundingClientRect(),
      };
    }

    if (element.closest("main > nav")) {
      return {
        key: "taskbar",
        kind: "taskbar",
        label: "taskbar",
        rect: element.getBoundingClientRect(),
      };
    }

    if (element.tagName === "MAIN") {
      return {
        key: "wallpaper",
        kind: "wallpaper",
        label: "wallpaper",
        rect: element.getBoundingClientRect(),
      };
    }
  }

  return undefined;
};

/** A currently-audible sound source, in client coordinates. */
type SoundSource = {
  /** Rough loudness 0..1 from playback state and volume — no audio APIs. */
  intensity: number;
  x: number;
  y: number;
};

/**
 * What the desktop sounds like — to the flies only. Nothing here plays,
 * records, or routes audio: Webamp's exposed store and the DOM's media
 * elements already say what is playing and how loud, and a fly feels that
 * as substrate vibration near the source window.
 */
export const senseSound = (): SoundSource[] => {
  const sources: SoundSource[] = [];
  const addRect = (rect: DOMRect, intensity: number): void => {
    if (rect.width > 0 && intensity > 0.01) {
      sources.push({
        intensity: Math.min(intensity, 1),
        x: (rect.left + rect.right) / 2,
        y: (rect.top + rect.bottom) / 2,
      });
    }
  };
  const webampState = window.WebampGlobal?.store?.getState?.();

  if (webampState?.media?.status === "PLAYING") {
    const volume = (webampState.media.volume ?? 50) / 100;
    const el =
      document.querySelector("#webamp .window") ??
      document.querySelector("#webamp");

    if (el) addRect(el.getBoundingClientRect(), volume);
  }

  document.querySelectorAll("audio, video").forEach((el) => {
    if (
      el instanceof HTMLMediaElement &&
      !el.paused &&
      !el.muted &&
      el.volume > 0 &&
      el.readyState >= 2
    ) {
      const box = el.closest("main .react-draggable") ?? el;

      addRect(box.getBoundingClientRect(), el.volume);
    }
  });

  return sources;
};

/**
 * A tiny retina for the wallpaper: refreshed occasionally from whatever is
 * painting the background (worker canvas, video, or a CSS image), sampled
 * cheaply every frame. All failure modes — transferred canvases that refuse
 * `drawImage`, tainted images, missing sources — degrade to "no gradient".
 */
export class WallpaperEye {
  private readonly canvas: HTMLCanvasElement;

  private readonly ctx: CanvasRenderingContext2D | null;

  private data?: Uint8ClampedArray;

  private imageUrl?: string;

  private image?: HTMLImageElement;

  public constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = EYE_COLS;
    this.canvas.height = EYE_ROWS;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
  }

  private capture(source: CanvasImageSource): boolean {
    if (!this.ctx) return false;

    try {
      this.ctx.drawImage(source, 0, 0, EYE_COLS, EYE_ROWS);
      this.data = this.ctx.getImageData(0, 0, EYE_COLS, EYE_ROWS).data;

      return true;
    } catch {
      return false;
    }
  }

  /** Re-read the wallpaper. Call at a slow cadence, not per frame. */
  public refresh(container: HTMLElement): void {
    const video = container.querySelector(":scope > video");

    if (video instanceof HTMLVideoElement && this.capture(video)) return;

    const canvas = container.querySelector(":scope > canvas:not(#desktop-fly)");

    if (canvas instanceof HTMLCanvasElement && this.capture(canvas)) return;

    // CSS image wallpapers: pull the url out of the background custom
    // properties and sample the image itself once it loads.
    const { style } = document.documentElement;
    const background =
      style.getPropertyValue("--after-background") ||
      style.getPropertyValue("--before-background");
    const [, url] = /url\("?([^")]+)"?\)/.exec(background) || [];

    if (!url) {
      this.data = undefined;

      return;
    }

    if (url !== this.imageUrl) {
      this.imageUrl = url;
      this.image = new Image();
      this.image.crossOrigin = "anonymous";
      this.image.src = url;
    }
    if (this.image?.complete && this.image.naturalWidth > 0) {
      this.capture(this.image);
    }
  }

  /**
   * Perceived brightness at a client point, 0..1, or `undefined` when the
   * wallpaper cannot be sampled (no gradient is better than a fake one).
   */
  public brightnessAt(clientX: number, clientY: number): number | undefined {
    if (!this.data) return undefined;

    const col = Math.min(
      Math.max(Math.floor((clientX / window.innerWidth) * EYE_COLS), 0),
      EYE_COLS - 1
    );
    const row = Math.min(
      Math.max(Math.floor((clientY / window.innerHeight) * EYE_ROWS), 0),
      EYE_ROWS - 1
    );
    const i = (row * EYE_COLS + col) * 4;

    return (
      (0.2126 * this.data[i] +
        0.7152 * this.data[i + 1] +
        0.0722 * this.data[i + 2]) /
      255
    );
  }
}
