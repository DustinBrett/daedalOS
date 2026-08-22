// Turning daedalOS window geometry into a world the fly can walk on.
// The desktop's windows (`.react-draggable` wrappers and Webamp's windows)
// become walkable top edges, occluded front-to-back by z-index, plus the
// taskbar top as the screen floor. Ported from gnat's `terrain.rs` (MIT) with
// Hyprland IPC swapped for the DOM.

import { type Ledge } from "utils/desktopFly/fly";
import { TASKBAR_HEIGHT } from "utils/constants";

/** A walkable horizontal edge in screen coordinates. */
type ScreenLedge = {
  id: number;
  x0: number;
  x1: number;
  y: number;
};

type TerrainRect = {
  bottom: number;
  id: number;
  left: number;
  right: number;
  top: number;
  z: number;
};

// Stable window identity across polls, so the fly can notice when the thing
// it is standing on closes.
const windowIds = new WeakMap<Element, number>();
let nextWindowId = 1;

const idFor = (element: Element): number => {
  let id = windowIds.get(element);

  if (id === undefined) {
    id = nextWindowId;
    nextWindowId += 1;
    windowIds.set(element, id);
  }

  return id;
};

const MIN_LEDGE_WIDTH = 24;

const collectRects = (width: number, height: number): TerrainRect[] => {
  const rects: TerrainRect[] = [];
  const addElement = (element: Element, zOverride?: number): void => {
    const { style } = element as HTMLElement;

    // Minimized windows keep their DOM box but get pointer-events: none.
    if (style.pointerEvents === "none") return;

    const { bottom, left, right, top } = element.getBoundingClientRect();

    if (right - left < MIN_LEDGE_WIDTH || bottom <= top) return;
    if (top < 4 || top > height - TASKBAR_HEIGHT) return;

    const z =
      zOverride ??
      Number.parseInt(
        style.zIndex || window.getComputedStyle(element).zIndex,
        10
      );

    rects.push({
      bottom,
      id: idFor(element),
      left: Math.max(left, 0),
      right: Math.min(right, width),
      top,
      z: Number.isNaN(z) ? 0 : z,
    });
  };

  document
    .querySelectorAll("main .react-draggable")
    .forEach((element) => addElement(element));

  const webamp = document.querySelector("#webamp");

  if (webamp instanceof HTMLElement) {
    const webampZ = Number.parseInt(window.getComputedStyle(webamp).zIndex, 10);

    webamp
      .querySelectorAll(".window")
      .forEach((element) =>
        addElement(element, Number.isNaN(webampZ) ? 0 : webampZ)
      );
  }

  // Front-to-back: highest z first.
  return rects.sort((a, b) => b.z - a.z);
};

/** Remove each occluder's horizontal span from `[x0, x1)`. */
const subtractSpans = (
  x0: number,
  x1: number,
  occluders: TerrainRect[]
): [number, number][] => {
  let spans: [number, number][] = [[x0, x1]];

  occluders.forEach(({ left, right }) => {
    spans = spans.flatMap(([start, end]) => {
      if (right <= start || left >= end) return [[start, end]];

      const parts: [number, number][] = [];

      if (left > start) parts.push([start, left]);
      if (right < end) parts.push([right, end]);

      return parts;
    });
  });

  return spans;
};

/** A window's full box in screen coordinates, for the looming sense. */
type ScreenRect = {
  bottom: number;
  id: number;
  left: number;
  right: number;
  top: number;
};

type TerrainSense = {
  ledges: ScreenLedge[];
  rects: ScreenRect[];
};

/**
 * One DOM pass over the desktop: the walkable window top edges (plus the
 * floor at the top of the taskbar) and the raw window boxes, whose movement
 * between polls feeds the looming sense. A ledge is only walkable where no
 * window in front of it covers that span.
 */
export const senseTerrain = (width: number, height: number): TerrainSense => {
  const out: ScreenLedge[] = [
    { id: 0, x0: 0, x1: width, y: height - TASKBAR_HEIGHT },
  ];
  const rects = collectRects(width, height);

  rects.forEach((rect, i) => {
    // Occluders are the windows stacked in front of this one, where their
    // vertical span covers this window's top edge.
    const occluders = rects
      .slice(0, i)
      .filter((other) => other.top <= rect.top && other.bottom > rect.top);

    subtractSpans(rect.left, rect.right, occluders).forEach(([x0, x1]) => {
      if (x1 - x0 >= MIN_LEDGE_WIDTH) {
        out.push({ id: rect.id, x0, x1, y: rect.top });
      }
    });
  });

  return {
    ledges: out,
    rects: rects.map(({ bottom, id, left, right, top }) => ({
      bottom,
      id,
      left,
      right,
      top,
    })),
  };
};

/** Convert walkable edges into the body's scene frame (+y up, origin centre). */
export const ledgesToScene = (
  ledges: ScreenLedge[],
  width: number,
  height: number
): Ledge[] =>
  ledges.map(({ id, x0, x1, y }) => ({
    id,
    x0: x0 - width / 2,
    x1: x1 - width / 2,
    y: height / 2 - y,
  }));
