// Drawing the fly, top-down, onto a 2D canvas. The body model is the source
// of every angle here — this file invents nothing about behaviour, it only
// decides what the numbers look like. Ported from gnat's `render.rs` (MIT),
// with the software rasteriser swapped for Canvas2D.
//
// Altitude is conveyed the way an animator would: the fly scales up, and its
// shadow slides away and softens.

import { type Fly } from "utils/desktopFly/fly";

const THORAX = "rgb(96, 72, 42)";
const ABDOMEN = "rgb(146, 110, 62)";
const BAND = "rgba(48, 34, 20, 0.51)";
const HEAD = "rgb(104, 78, 44)";
const EYE = "rgb(158, 44, 36)";
const LEG = "rgb(70, 51, 30)";
const WING = "rgba(214, 226, 240, 0.27)";
const WING_VEIN = "rgba(150, 168, 190, 0.24)";

// Body-local landmarks, in scene units. +y is forward, +x is right.
const HEAD_Y = 7;
const THORAX_Y = 1.4;
const ABDOMEN_Y = -5.6;
/** Where each leg meets the body, from the original's attachment table. */
const LEG_ATTACH: [number, number][] = [
  [2.6, 4.6],
  [-2.6, 4.6],
  [3.2, 1.6],
  [-3.2, 1.6],
  [2.9, -1],
  [-2.9, -1],
];
/** Real fly legs are tucked close under the body from above. */
const LEG_LEN = 7.2;

const HALF_PI = Math.PI / 2;

/** Scene frame: origin at the centre of the output, +y up. */
export type Frame = {
  height: number;
  width: number;
};

export const toScreen = (
  frame: Frame,
  x: number,
  y: number
): [number, number] => [x + frame.width / 2, frame.height / 2 - y];

export const toScene = (
  frame: Frame,
  x: number,
  y: number
): [number, number] => [x - frame.width / 2, frame.height / 2 - y];

/** Maps body-local coordinates onto the canvas. */
class Pose {
  public readonly origin: [number, number];

  /** Unit vectors, in screen pixels. */
  public readonly forward: [number, number];

  public readonly right: [number, number];

  public readonly scale: number;

  public constructor(fly: Fly, frame: Frame) {
    this.origin = toScreen(frame, fly.pos.x, fly.pos.y);

    const sin = Math.sin(fly.heading);
    const cos = Math.cos(fly.heading);

    // Scene +y is up and screen +y is down, so every y component flips.
    this.forward = [cos, -sin];
    this.right = [sin, cos];
    this.scale = fly.scale;
  }

  /** A body-local point, in canvas pixels. */
  public at(x: number, y: number): [number, number] {
    const sx = x * this.scale;
    const sy = y * this.scale;

    return [
      this.origin[0] + this.forward[0] * sy + this.right[0] * sx,
      this.origin[1] + this.forward[1] * sy + this.right[1] * sx,
    ];
  }

  /** Rotation so that an ellipse's ry axis runs along the body. */
  public bodyAngle(extra: number): number {
    return Math.atan2(this.forward[1], this.forward[0]) - HALF_PI + extra;
  }

  public px(units: number): number {
    return units * this.scale;
  }
}

const ellipse = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
  fill: string
): void => {
  ctx.beginPath();
  ctx.ellipse(
    cx,
    cy,
    Math.max(rx, 0.1),
    Math.max(ry, 0.1),
    angle,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = fill;
  ctx.fill();
};

const line = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  stroke: string
): void => {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineWidth = Math.max(width, 0.4);
  ctx.strokeStyle = stroke;
  ctx.lineCap = "round";
  ctx.stroke();
};

const drawShadow = (
  ctx: CanvasRenderingContext2D,
  fly: Fly,
  frame: Frame
): void => {
  // Height pushes the shadow away and fades it, the only altitude cue a flat
  // canvas has.
  const lift = Math.min(Math.max(fly.z / 90, 0), 1);
  const [sx, sy] = toScreen(
    frame,
    fly.pos.x - 10 * lift,
    fly.pos.y - 16 * lift
  );
  const alpha = (0.29 * (1 - 0.7 * lift)).toFixed(3);
  const spread = 1 + 0.6 * lift;
  const angle =
    Math.atan2(-Math.sin(fly.heading), Math.cos(fly.heading)) - HALF_PI;

  ellipse(
    ctx,
    sx,
    sy,
    4 * fly.scale * spread,
    8.5 * fly.scale * spread,
    angle,
    `rgba(0, 0, 0, ${alpha})`
  );
};

const drawLegs = (ctx: CanvasRenderingContext2D, fly: Fly, p: Pose): void => {
  fly.legs.forEach((leg, index) => {
    const [ax, ay] = LEG_ATTACH[index];
    // `lift` raises the leg mid-swing; from directly above that reads as
    // foreshortening rather than height.
    const reach = LEG_LEN * (1 - 0.3 * leg.lift);
    const dir = leg.baseYaw + leg.swingSign * leg.angle;
    const [rootX, rootY] = p.at(ax, ay);
    const kneeLocal: [number, number] = [
      ax + Math.cos(dir) * reach * 0.5,
      ay + Math.sin(dir) * reach * 0.5,
    ];
    // The lower segment folds back, so a leg reads as a joint and not a spoke.
    const fold = dir + leg.swingSign * 0.9;
    const footLocal: [number, number] = [
      kneeLocal[0] + Math.cos(fold) * reach * 0.5,
      kneeLocal[1] + Math.sin(fold) * reach * 0.5,
    ];
    const [kneeX, kneeY] = p.at(kneeLocal[0], kneeLocal[1]);
    const [footX, footY] = p.at(footLocal[0], footLocal[1]);

    line(ctx, rootX, rootY, kneeX, kneeY, p.px(0.8), LEG);
    line(ctx, kneeX, kneeY, footX, footY, p.px(0.6), LEG);
  });
};

const drawWings = (ctx: CanvasRenderingContext2D, fly: Fly, p: Pose): void => {
  // Real Drosophila wings are nearly body length: folded flat they reach
  // well past the abdomen tip, the single most recognisable silhouette cue.
  const HALF_LEN = 7.8;

  fly.wings.forEach((wing, i) => {
    const side = i === 0 ? -1 : 1;
    // `wing.z` is how far the wing is swept out from the body axis; at rest it
    // is near 0.13 and folded flat, in flight it sweeps to about 0.8.
    const sweep = 0.3 + Math.abs(wing.z);
    // `wing.x` is the stroke; seen from above it mostly shortens the wing.
    const foreshorten = 1 - 0.4 * Math.abs(wing.x);
    const len = HALF_LEN * foreshorten;
    // Hinge at the rear of the thorax, wing running back and outward.
    const hinge: [number, number] = [side * 1.4, THORAX_Y - 1.6];
    const centreLocal: [number, number] = [
      hinge[0] + side * len * Math.sin(sweep),
      hinge[1] - len * Math.cos(sweep),
    ];
    const [cx, cy] = p.at(centreLocal[0], centreLocal[1]);
    const angle = p.bodyAngle(-side * sweep);

    ellipse(ctx, cx, cy, p.px(1.8), p.px(len), angle, WING);
    // One vein down the middle: enough to stop the wing reading as a smear.
    ellipse(ctx, cx, cy, p.px(0.4), p.px(len * 0.85), angle, WING_VEIN);
  });
};

/** Draw one fly. */
export const drawFly = (
  ctx: CanvasRenderingContext2D,
  fly: Fly,
  frame: Frame
): void => {
  // The shadow belongs to the surface, so it goes down first.
  drawShadow(ctx, fly, frame);

  const p = new Pose(fly, frame);

  drawLegs(ctx, fly, p);

  // Abdomen, then thorax, then head: back to front along the body.
  const [ax, ay] = p.at(0, ABDOMEN_Y);

  ellipse(
    ctx,
    ax,
    ay,
    p.px(3.3),
    p.px(5.6) * fly.breath,
    p.bodyAngle(0),
    ABDOMEN
  );
  // Dark tergite bands, the thing that makes a brown blob read as an
  // abdomen at this size. D. melanogaster's posterior tergites are the
  // darkest, so the bands thicken toward the tip (negative k is rearward).
  [-0.62, -0.35, 0.05, 0.42].forEach((k) => {
    const [bx, by] = p.at(0, ABDOMEN_Y + k * 5.6);

    ellipse(
      ctx,
      bx,
      by,
      p.px(3.2 * (1 - 0.35 * Math.abs(k))),
      p.px(0.7 + 0.6 * Math.max(-k, 0)),
      p.bodyAngle(0),
      BAND
    );
  });

  // Wings sit over the abdomen: folded there at rest, sweeping through it in
  // flight. They are never hidden — a fly with no wings reads as an ant.
  drawWings(ctx, fly, p);

  const [tx, ty] = p.at(0, THORAX_Y);

  ellipse(ctx, tx, ty, p.px(3.4), p.px(4.4), p.bodyAngle(0), THORAX);

  const [hx, hy] = p.at(0, HEAD_Y);

  ellipse(ctx, hx, hy, p.px(3), p.px(2.4), p.bodyAngle(0), HEAD);
  // The eyes wrap the sides of the head and take up most of it — the single
  // strongest "this is a fly" cue at twenty pixels.
  [-1, 1].forEach((side) => {
    const [ex, ey] = p.at(side * 1.5, HEAD_Y + 0.2);

    ellipse(ctx, ex, ey, p.px(1.8), p.px(2.1), p.bodyAngle(side * 0.35), EYE);
  });

  // Antennae.
  [-1, 1].forEach((side) => {
    const [bx, by] = p.at(side * 0.8, HEAD_Y + 1.2);
    const [tipX, tipY] = p.at(side * 1.8, HEAD_Y + 2.8);

    line(ctx, bx, by, tipX, tipY, p.px(0.5), LEG);
  });
};
