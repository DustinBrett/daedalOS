// Drawing the fly, top-down, onto a 2D canvas. The body model is the source
// of every angle here — this file invents nothing about behaviour, it only
// decides what the numbers look like. Ported from gnat's `render.rs` (MIT),
// with the software rasteriser swapped for Canvas2D.
//
// Altitude is conveyed the way an animator would: the fly scales up, and its
// shadow slides away and softens.

import { type Fly, FlyState } from "utils/desktopFly/fly";

// D. melanogaster palette: tawny ochre body, brick-red compound eyes, dark
// tergite banding that thickens toward a nearly black abdomen tip, smoky
// translucent wings, and cream-coloured halteres. Base colours only — each
// fly's cuticle tone and melanisation vary them individually below.
const THORAX_RGB: [number, number, number] = [139, 102, 54];
const SCUTELLUM_RGB: [number, number, number] = [116, 84, 44];
const ABDOMEN_RGB: [number, number, number] = [168, 126, 66];
const HEAD_RGB: [number, number, number] = [148, 109, 57];
const EYE_RGB: [number, number, number] = [184, 46, 32];
const LEG_RGB: [number, number, number] = [84, 60, 34];
const WING = "rgba(208, 218, 232, 0.28)";
const WING_VEIN = "rgba(122, 140, 162, 0.34)";
const HALTERE = "rgb(216, 192, 142)";

/** One individual's colours, derived once from its phenotype. */
type Palette = {
  abdomen: string;
  band: string;
  eye: string;
  head: string;
  leg: string;
  scutellum: string;
  thorax: string;
  tip: string;
};

const shade = ([r, g, b]: [number, number, number], tone: number): string =>
  `rgb(${Math.min(Math.round(r * tone), 255)}, ${Math.min(
    Math.round(g * tone),
    255
  )}, ${Math.min(Math.round(b * tone), 255)})`;

const palettes = new WeakMap<Fly, Palette>();

/**
 * Realistic individual variation: overall cuticle tone (lighter and darker
 * flies) and abdominal melanisation (how dark the tergite bands and tip
 * are), both fixed per fly at creation.
 */
const paletteFor = (fly: Fly): Palette => {
  let palette = palettes.get(fly);

  if (!palette) {
    const { bandStrength, tone } = fly.phenotype;
    // Eyes vary less than cuticle.
    const eyeTone = 1 + (tone - 1) * 0.5;

    palette = {
      abdomen: shade(ABDOMEN_RGB, tone),
      band: `rgba(52, 36, 20, ${Math.min(0.62 * bandStrength, 0.85).toFixed(3)})`,
      eye: shade(EYE_RGB, eyeTone),
      head: shade(HEAD_RGB, tone),
      leg: shade(LEG_RGB, tone),
      scutellum: shade(SCUTELLUM_RGB, tone),
      thorax: shade(THORAX_RGB, tone),
      tip: `rgba(43, 29, 16, ${Math.min(0.85 * bandStrength, 0.97).toFixed(3)})`,
    };
    palettes.set(fly, palette);
  }

  return palette;
};

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

// Hoisted iteration constants: drawFly runs for every fly on every frame,
// and these literals were re-allocated on each call.
const SIDES = [-1, 1];
const MALE_BANDS = [0.05, 0.42];
const FEMALE_BANDS = [-0.62, -0.35, 0.05, 0.42];
const OCELLI: [number, number][] = [
  [0, 0.55],
  [-0.62, -0.35],
  [0.62, -0.35],
];
const WING_NOTCHES = [0.55, 0.86];

/** Scene frame: origin at the centre of the output, +y up. */
export type Frame = {
  height: number;
  width: number;
};

const toScreen = (frame: Frame, x: number, y: number): [number, number] => [
  x + frame.width / 2,
  frame.height / 2 - y,
];

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

  /** Reused result of at(): drawFly calls it ~50 times per fly per frame,
   * so each call returning a fresh tuple was steady per-frame garbage.
   * Destructure the result before the next call. */
  private readonly point: [number, number] = [0, 0];

  public constructor(fly: Fly, frame: Frame) {
    this.origin = toScreen(frame, fly.pos.x, fly.pos.y);

    const sin = Math.sin(fly.heading);
    const cos = Math.cos(fly.heading);
    // Pitch, seen from above, is foreshortening along the body axis: a fly
    // pitched nose-up in its climb-out reads a little shorter, and relaxes
    // to full length as it levels off. The model computed this on every
    // flight frame and the renderer never read it — a field doing pushups
    // in the dark until the write-only scan caught it.
    const fore = Math.cos(fly.pitch);

    // Scene +y is up and screen +y is down, so every y component flips.
    this.forward = [cos * fore, -sin * fore];
    this.right = [sin, cos];
    this.scale = fly.scale;
  }

  /** A body-local point, in canvas pixels. Reuses one tuple — see above. */
  public at(x: number, y: number): [number, number] {
    const sx = x * this.scale;
    const sy = y * this.scale;
    const { point } = this;

    point[0] = this.origin[0] + this.forward[0] * sy + this.right[0] * sx;
    point[1] = this.origin[1] + this.forward[1] * sy + this.right[1] * sx;

    return point;
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
  // canvas has. Standing on something counts: a fly on a window rim throws
  // its shadow down onto the desktop below it.
  const lift = Math.min(Math.max((fly.z + fly.surfaceZ) / 90, 0), 1);
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

const drawLegs = (
  ctx: CanvasRenderingContext2D,
  fly: Fly,
  p: Pose,
  legColor: string,
  combColor: string
): void => {
  // The sex comb: a row of ~11 stout black bristles on the metatarsus of the
  // male foreleg, and the most reliable way to sex a fly by eye (Jürgens et
  // al. 2024, Fig 40). Females have nothing there. Rendered as the thickened,
  // blackened distal segment it reads as at this size.
  const male = fly.phenotype.sex === "male";

  fly.legs.forEach((leg, index) => {
    const [ax, ay] = LEG_ATTACH[index];
    // `lift` raises the leg mid-swing; from directly above that reads as
    // foreshortening rather than height.
    // A sleeping fly hunkers: legs flexed under the body, which from above
    // reads as the whole silhouette pulling in.
    const reach = LEG_LEN * (1 - 0.3 * leg.lift) * (1 - 0.3 * fly.restDepth);
    const dir = leg.baseYaw + leg.swingSign * leg.angle;
    const [rootX, rootY] = p.at(ax, ay);
    const kneeLX = ax + Math.cos(dir) * reach * 0.5;
    const kneeLY = ay + Math.sin(dir) * reach * 0.5;
    // The lower segment folds back, so a leg reads as a joint and not a spoke.
    const fold = dir + leg.swingSign * 0.9;
    const [kneeX, kneeY] = p.at(kneeLX, kneeLY);
    const [footX, footY] = p.at(
      kneeLX + Math.cos(fold) * reach * 0.5,
      kneeLY + Math.sin(fold) * reach * 0.5
    );

    line(ctx, rootX, rootY, kneeX, kneeY, p.px(0.8), legColor);
    line(ctx, kneeX, kneeY, footX, footY, p.px(0.6), legColor);
    if (male && leg.isFront) {
      // Outer third of the foreleg tarsus, where the comb sits.
      const combX = kneeX + (footX - kneeX) * 0.55;
      const combY = kneeY + (footY - kneeY) * 0.55;

      line(ctx, combX, combY, footX, footY, p.px(1.05), combColor);
    }
  });
};

const drawWings = (ctx: CanvasRenderingContext2D, fly: Fly, p: Pose): void => {
  // Real Drosophila wings are nearly body length: folded flat they reach
  // well past the abdomen tip, the single most recognisable silhouette cue.
  // Individuals vary a little in wing length.
  const HALF_LEN = 7.8 * fly.phenotype.wingLen;

  fly.wings.forEach((wing, i) => {
    const side = i === 0 ? -1 : 1;
    // Permanent wear: a torn wing is shorter, narrower, and notched.
    const wear = fly.wingDamage[i];
    // `wing.z` is how far the wing is swept out from the body axis; at rest it
    // is near 0.13 and folded flat, in flight it sweeps to about 0.8. The
    // mapping pins both ends against photographs: at rest ~15 deg off the
    // body axis, so the two wings overlap over the abdomen the way a real
    // resting fly's do (the 0.3 offset used here before splayed them to
    // ~25 deg, a fly halfway to a threat display); in flight ~63 deg.
    const sweep = 0.12 + Math.abs(wing.z) * 1.25;
    // `wing.x` is the stroke; seen from above it mostly shortens the wing.
    const foreshorten = 1 - 0.4 * Math.abs(wing.x);
    const len = HALF_LEN * foreshorten * (1 - 0.4 * wear);
    // Hinge at the rear of the thorax, wing running back and outward.
    const [cx, cy] = p.at(
      side * 1.4 + side * len * Math.sin(sweep),
      THORAX_Y - 1.6 - len * Math.cos(sweep)
    );
    const angle = p.bodyAngle(-side * sweep);

    const halfWidth = p.px(1.8 * (1 - 0.45 * wear));

    if (wear > 0.02) {
      // A torn wing has pieces missing from its trailing edge, and that is
      // the only thing that reads as damage at this size — a few percent
      // off the length is invisible. Clip the holes out of the wing alone,
      // so nothing under it is disturbed.
      //
      // These were sized in body units and came out sub-pixel: a notch of
      // 0.87 px on a fly 19 px long is not damage anyone can see, so the
      // model tore wings that looked exactly like intact ones. Anything
      // meant to be read off a sprite this small has to be sized against
      // the sprite, not against the animal.
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        cx - p.px(len) * 2 - 8,
        cy - p.px(len) * 2 - 8,
        p.px(len) * 4 + 16,
        p.px(len) * 4 + 16
      );
      // Two bites out of the outer half, sized by how badly torn it is.
      WING_NOTCHES.forEach((along, n) => {
        const reach = p.px(len) * along;
        const outward = halfWidth * (n === 0 ? 0.9 : 0.5);
        const nx =
          cx + Math.cos(angle + HALF_PI) * reach + Math.cos(angle) * outward;
        const ny =
          cy + Math.sin(angle + HALF_PI) * reach + Math.sin(angle) * outward;

        ctx.moveTo(nx, ny);
        ctx.arc(nx, ny, Math.max(p.px(1.2 + 2.6 * wear), 1.1), 0, Math.PI * 2);
      });
      ctx.clip("evenodd");
      ellipse(ctx, cx, cy, halfWidth, p.px(len), angle, WING);
      ctx.restore();
    } else {
      ellipse(ctx, cx, cy, halfWidth, p.px(len), angle, WING);
    }
    // Longitudinal veins: enough venation to stop the wing reading as a
    // smear without cluttering it at twenty pixels.
    ellipse(ctx, cx, cy, p.px(0.35), p.px(len * 0.85), angle, WING_VEIN);
    ellipse(
      ctx,
      cx + Math.cos(angle) * p.px(0.9),
      cy + Math.sin(angle) * p.px(0.9),
      p.px(0.28),
      p.px(len * 0.7),
      angle,
      WING_VEIN
    );
  });
};

/** Halteres: the club-shaped hindwing remnants, visible when airborne. */
const drawHalteres = (
  ctx: CanvasRenderingContext2D,
  fly: Fly,
  p: Pose
): void => {
  SIDES.forEach((side) => {
    const [bx, by] = p.at(side * 1.8, THORAX_Y - 2.4);
    const [knobX, knobY] = p.at(side * 3, THORAX_Y - 3.3);

    line(ctx, bx, by, knobX, knobY, p.px(0.4), HALTERE);
    ellipse(ctx, knobX, knobY, p.px(0.55), p.px(0.55), 0, HALTERE);
  });
};

/**
 * Radius around the fly's screen position that drawFly can touch, in px —
 * for dirty-rect clearing. Worst case is a swept wing tip (~18.5 body units
 * from the origin, scaled), while the shadow slides up to ~19 px away and
 * spreads ~26 px at full altitude; the flat margin covers both, plus stroke
 * caps and antialiasing.
 */
export const drawRadius = (fly: Fly): number => 20 * fly.scale + 24;

/** Draw one fly. */
export const drawFly = (
  ctx: CanvasRenderingContext2D,
  fly: Fly,
  frame: Frame
): void => {
  // The shadow belongs to the surface, so it goes down first.
  drawShadow(ctx, fly, frame);

  const p = new Pose(fly, frame);
  const palette = paletteFor(fly);
  const isMale = fly.phenotype.sex === "male";
  // Sexual dimorphism: males carry a shorter, rounder abdomen whose rear
  // tergites are fused into one solid dark patch; females a longer, pointed
  // abdomen with separate bands all the way back.
  const abLen = isMale ? 4.9 : 5.6;

  drawLegs(ctx, fly, p, palette.leg, palette.tip);

  // Abdomen, then thorax, then head: back to front along the body.
  const [ax, ay] = p.at(0, ABDOMEN_Y);

  ellipse(
    ctx,
    ax,
    ay,
    p.px(3.3),
    p.px(abLen) * fly.breath,
    p.bodyAngle(0),
    palette.abdomen
  );
  // Dark tergite bands, the thing that makes a brown blob read as an
  // abdomen at this size. D. melanogaster's posterior tergites are the
  // darkest, so the bands thicken toward the tip (negative k is rearward);
  // in males the posterior bands are subsumed by the solid patch.
  (isMale ? MALE_BANDS : FEMALE_BANDS).forEach((k) => {
    const [bx, by] = p.at(0, ABDOMEN_Y + k * abLen);

    ellipse(
      ctx,
      bx,
      by,
      p.px(3.2 * (1 - 0.35 * Math.abs(k))),
      p.px(0.7 + 0.6 * Math.max(-k, 0)),
      p.bodyAngle(0),
      palette.band
    );
  });
  if (isMale) {
    // The fused black posterior — the classic male field mark.
    const [mx, my] = p.at(0, ABDOMEN_Y - 2.2);

    ellipse(
      ctx,
      mx,
      my,
      p.px(2.9),
      p.px(2.7) * fly.breath,
      p.bodyAngle(0),
      palette.tip
    );
  } else {
    // Female: separate dark bands ending in a pointed tip.
    const [abTipX, abTipY] = p.at(0, ABDOMEN_Y - 4.4);

    ellipse(
      ctx,
      abTipX,
      abTipY,
      p.px(1.7),
      p.px(1.9) * fly.breath,
      p.bodyAngle(0),
      palette.tip
    );
  }

  // Halteres beat behind the wings whenever the wings are swept for flight.
  if (fly.state === FlyState.Flying || fly.state === FlyState.Caught) {
    drawHalteres(ctx, fly, p);
  }

  // Wings sit over the abdomen: folded there at rest, sweeping through it in
  // flight. They are never hidden — a fly with no wings reads as an ant.
  drawWings(ctx, fly, p);

  const [tx, ty] = p.at(0, THORAX_Y);

  ellipse(ctx, tx, ty, p.px(3.4), p.px(4.4), p.bodyAngle(0), palette.thorax);
  // Scutellum: the darker shield at the rear of the thorax.
  const [scX, scY] = p.at(0, THORAX_Y - 3);

  ellipse(
    ctx,
    scX,
    scY,
    p.px(1.9),
    p.px(1.3),
    p.bodyAngle(0),
    palette.scutellum
  );

  const [hx, hy] = p.at(0, HEAD_Y);

  ellipse(ctx, hx, hy, p.px(3), p.px(2.4), p.bodyAngle(0), palette.head);
  // The eyes wrap the sides of the head and take up most of it — the single
  // strongest "this is a fly" cue at twenty pixels. They sit laterally with
  // the frons between them: centred any closer they fuse into one red blob
  // across the head front, which no real fly shows from above (and which is
  // exactly where the ocellar triangle drawn below belongs).
  SIDES.forEach((side) => {
    const [ex, ey] = p.at(side * 1.75, HEAD_Y + 0.2);

    ellipse(
      ctx,
      ex,
      ey,
      p.px(1.5),
      p.px(2.1),
      p.bodyAngle(side * 0.35),
      palette.eye
    );
  });

  // Proboscis extension: a brief dab at the substrate to taste it.
  if (fly.tasteTimer > 0) {
    const reach = 1.6 + 0.5 * Math.sin(fly.time * 9);
    const [pbX, pbY] = p.at(0, HEAD_Y + 0.6);
    const [pbTipX, pbTipY] = p.at(0, HEAD_Y + 0.6 + reach);

    line(ctx, pbX, pbY, pbTipX, pbTipY, p.px(0.7), palette.scutellum);
  }

  // The three ocelli: simple light-sensing lenses in a triangle on the
  // vertex, median one facing forward and a pair behind it. They are what
  // the fly levels itself against the horizon with.
  OCELLI.forEach(([ox, oy]) => {
    const [px2, py2] = p.at(ox, HEAD_Y - 0.7 + oy);

    ellipse(ctx, px2, py2, p.px(0.3), p.px(0.3), 0, palette.scutellum);
  });

  // Antennae, each ending in an arista — a giant branched bristle, not a
  // spike. It is the fly's ear: the branches catch air displacement, and
  // the whole thing twists like a rotary receiver (Göpfert & Robert 2002).
  SIDES.forEach((side) => {
    const [bx, by] = p.at(side * 0.8, HEAD_Y + 1.2);
    const [tipX, tipY] = p.at(side * 1.8, HEAD_Y + 2.8);

    line(ctx, bx, by, tipX, tipY, p.px(0.5), palette.leg);

    // Feathering, alternating either side of the shaft.
    const shaft = Math.atan2(tipY - by, tipX - bx);

    [0.35, 0.62, 0.88].forEach((along, n) => {
      const rx = bx + (tipX - bx) * along;
      const ry = by + (tipY - by) * along;
      const branch = shaft + (n % 2 === 0 ? 0.85 : -0.85) * side;
      const reach = p.px(1.1 - 0.2 * n);

      line(
        ctx,
        rx,
        ry,
        rx + Math.cos(branch) * reach,
        ry + Math.sin(branch) * reach,
        p.px(0.26),
        palette.leg
      );
    });
  });
};
