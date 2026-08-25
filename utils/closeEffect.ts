import { DEFAULT_CLOSE_EFFECT } from "utils/constants";
import { getHtmlToImage } from "utils/functions";

export type ShaderEffect = {
  duration: number;
  fragmentSource: string;
  getScaleY?: (windowHeight: number) => number;
  name: string;
  nick: string;
  scale?: number;
  scaleY?: number;
  setupTextures?: (
    gl: WebGLRenderingContext,
    program: WebGLProgram
  ) => Promise<void> | void;
  uniformOverrides?: Record<string, number>;
};

// Pointer tracking — only registered when an effect is selected (not "None").
// Avoids adding a global listener on pages that never use window effects.
let lastPointerX = 0;
let lastPointerY = 0;
let pointerListenerActive = false;

const ensurePointerTracking = (): void => {
  if (pointerListenerActive || typeof window === "undefined") return;

  pointerListenerActive = true;
  window.addEventListener(
    "pointerdown",
    ({ clientX, clientY }) => {
      lastPointerX = clientX;
      lastPointerY = clientY;
    },
    { passive: true }
  );
};

// ─── WebGL Helpers ──────────────────────────────────────────────────────────

const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vTexCoord;
  void main() {
    vTexCoord = aPosition * 0.5 + 0.5;
    vTexCoord.y = 1.0 - vTexCoord.y;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const QUAD_VERTICES = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | undefined => {
  const shader = gl.createShader(type);

  if (!shader) return undefined;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return undefined;
  }

  return shader;
};

const createGlProgram = (
  gl: WebGLRenderingContext,
  fragmentSource: string
): WebGLProgram | undefined => {
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertShader || !fragShader) {
    if (vertShader) gl.deleteShader(vertShader);
    if (fragShader) gl.deleteShader(fragShader);
    return undefined;
  }

  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    return undefined;
  }

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  // Shaders are compiled into the program — detach and free driver resources
  gl.detachShader(program, vertShader);
  gl.detachShader(program, fragShader);
  gl.deleteShader(vertShader);
  gl.deleteShader(fragShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return undefined;
  }

  return program;
};

// ─── Effect Setup & Animation ───────────────────────────────────────────────

type EffectContext = {
  canvas: HTMLCanvasElement;
  duration: number;
  gl: WebGLRenderingContext;
  startTime: number;
  uProgress: WebGLUniformLocation | null;
};

const setupEffect = async (
  canvas: HTMLCanvasElement,
  capturedCanvas: HTMLCanvasElement,
  effect: ShaderEffect,
  pointerPos: [number, number],
  actorScaleY: number,
  padding: number,
  isMaximized: boolean,
  setUniforms: (
    ctx: WebGLRenderingContext,
    prog: WebGLProgram,
    nick: string,
    w: number,
    h: number,
    ms: number,
    pos?: [number, number],
    scaleY?: number
  ) => void
): Promise<EffectContext | undefined> => {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: "high-performance",
    premultipliedAlpha: true,
  });

  if (!gl) return undefined;

  // Enable derivatives (dFdx/dFdy) for T-Rex scratch folds & Incinerate shimmer
  gl.getExtension("OES_standard_derivatives");

  const program = createGlProgram(gl, effect.fragmentSource);

  if (!program) return undefined;

  gl.useProgram(program);

  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "aPosition");

  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // Upload window texture to unit 0
  // LINEAR matches BMW's Cogl pipeline default — smooth interpolation when
  // effects rotate/translate/scale shards, columns, or dust particles.
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    capturedCanvas
  );

  gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0);

  // Load extra textures (e.g. claws, shards) to unit 1+
  await effect.setupTextures?.(gl, program);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // BMW's uSize = [actor.width, actor.height] — the UNSCALED actor dimensions.
  // actor.scale_x/y is a visual transform that doesn't change actor.width/height.
  // Divide out the scale so shaders see the original window size, matching BMW.
  const dpr = window.devicePixelRatio || 1;
  const scaleX = effect.scale || 1;

  setUniforms(
    gl,
    program,
    effect.nick,
    canvas.width / dpr / scaleX,
    canvas.height / dpr / actorScaleY,
    effect.duration,
    pointerPos,
    actorScaleY
  );

  // BMW's uPadding = distance from actor edge to window content, used by
  // getAbsoluteEdgeMask for edge fading at the window boundary (not canvas edge)
  gl.uniform1f(gl.getUniformLocation(program, "uPadding"), padding);

  // BMW skips edge masks for maximized/fullscreen windows via uIsFullscreen
  gl.uniform1i(
    gl.getUniformLocation(program, "uIsFullscreen"),
    isMaximized ? 1 : 0
  );

  // Apply per-effect overrides after generic setup
  if (effect.uniformOverrides) {
    for (const [name, value] of Object.entries(effect.uniformOverrides)) {
      gl.uniform1f(gl.getUniformLocation(program, name), value);
    }
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);

  // Draw first frame synchronously — canvas has content before real window hides
  const uProgress = gl.getUniformLocation(program, "uProgress");

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(uProgress, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  return {
    canvas,
    duration: effect.duration,
    gl,
    startTime: performance.now(),
    uProgress,
  };
};

const runAnimation = ({
  canvas,
  duration,
  gl,
  startTime,
  uProgress,
}: EffectContext): Promise<void> =>
  new Promise<void>((resolve) => {
    const animate = (now: number): void => {
      const progress = Math.min((now - startTime) / duration, 1);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uProgress, progress);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });

// ─── Effect Names ───────────────────────────────────────────────────────────

const EFFECT_NICKS = [
  "broken-glass",
  "doom",
  "energize-a",
  "energize-b",
  "fire",
  "glitch",
  "hexagon",
  "incinerate",
  "matrix",
  "paint-brush",
  "pixelate",
  "pixel-wipe",
  "portal",
  "rgbwarp",
  "snap",
  "team-rocket",
  "trex",
  "tv",
  "wisps",
];

const NICK_TO_NAME: Record<string, string> = {
  rgbwarp: "RGB Warp",
  "team-rocket": "TeamRocket",
  trex: "T-Rex Attack",
  tv: "TV Effect",
};

export const nickToName = (nick: string): string =>
  NICK_TO_NAME[nick] ||
  nick
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const nameToNick = (name: string): string => {
  const lower = name.toLowerCase();
  const override = Object.entries(NICK_TO_NAME).find(
    ([, v]) => v.toLowerCase() === lower
  );

  return override ? override[0] : lower.replace(/ /g, "-");
};

export const CLOSE_EFFECT_NAMES = [
  "None",
  "Random",
  ...EFFECT_NICKS.map((nick) => nickToName(nick)),
].sort((a, b) => a.localeCompare(b));

// ─── State ──────────────────────────────────────────────────────────────────

let currentEffectName = DEFAULT_CLOSE_EFFECT;
let lastRandomNick = "";
let nextRandomNick = "";

const pickRandomNick = (exclude?: string): string => {
  const pool = exclude
    ? EFFECT_NICKS.filter((n) => n !== exclude)
    : EFFECT_NICKS;

  return pool[Math.floor(Math.random() * pool.length)];
};

const preloadNick = (nick: string): void => {
  import("utils/closeEffectShaders").then(({ preloadEffect }) =>
    preloadEffect(nick)
  );
};

export const setCurrentCloseEffect = (name: string): void => {
  currentEffectName = name;

  if (name === "None") return;

  ensurePointerTracking();
  getHtmlToImage(); // preload capture library so first close is instant

  if (name === "Random") {
    nextRandomNick = pickRandomNick(lastRandomNick);
    preloadNick(nextRandomNick);
  } else {
    preloadNick(nameToNick(name));
  }
};

// ─── Main Entry Point ───────────────────────────────────────────────────────

const hideRealWindow = (componentWindow: HTMLElement): void => {
  let ancestor = componentWindow.parentElement;

  while (ancestor && ancestor !== document.body) {
    if (ancestor.style.position === "absolute") {
      ancestor.style.opacity = "0";
      break;
    }
    ancestor = ancestor.parentElement;
  }
};

// Bake shadow and outline onto a padded canvas around the captured content.
// SVG foreignObject can't render box-shadow/outline (they're outside the box),
// so we recreate them with canvas 2D. Skin frames via ::before ARE captured
// by html-to-image directly.
const bakeShadowAndOutline = (
  capturedCanvas: HTMLCanvasElement,
  computedStyle: CSSStyleDeclaration,
  outlineOnly = false
): { canvas: HTMLCanvasElement; pad: number } => {
  const outlineWidth = Number.parseFloat(computedStyle.outlineWidth) || 0;

  let shadowBlur = 0;

  if (!outlineOnly) {
    const shadowBlurMatch = (computedStyle.boxShadow.match(/\d+px/g) || [])[2];

    if (shadowBlurMatch) shadowBlur = Number.parseFloat(shadowBlurMatch);
  }

  const pad = Math.ceil(shadowBlur * 2) + outlineWidth;

  if (pad <= 0) return { canvas: capturedCanvas, pad: 0 };

  const paddedCanvas = document.createElement("canvas");

  paddedCanvas.width = capturedCanvas.width + pad * 2;
  paddedCanvas.height = capturedCanvas.height + pad * 2;

  const ctx2d = paddedCanvas.getContext("2d");

  if (ctx2d) {
    // Draw outline first (behind everything)
    if (outlineWidth > 0) {
      ctx2d.strokeStyle = computedStyle.outlineColor;
      ctx2d.lineWidth = outlineWidth;
      ctx2d.strokeRect(
        pad - outlineWidth / 2,
        pad - outlineWidth / 2,
        capturedCanvas.width + outlineWidth,
        capturedCanvas.height + outlineWidth
      );
    }

    // Draw captured content WITH shadow enabled — the content's own shape
    // casts the shadow, so it works with any window style or skin frame
    if (shadowBlur > 0) {
      const shadowParts = computedStyle.boxShadow
        .trim()
        .match(/rgba?\([^)]+\)|#\S+|\S+/g);
      const shadowColor =
        shadowParts?.find((p) => /^rgba?\(|^#/i.test(p)) || "";

      if (shadowColor) {
        const shadowNums = (shadowParts || [])
          .filter((p) => p.endsWith("px"))
          .map((p) => Number.parseFloat(p));

        ctx2d.shadowColor = shadowColor;
        ctx2d.shadowBlur = shadowBlur;
        ctx2d.shadowOffsetX = shadowNums[0] || 0;
        ctx2d.shadowOffsetY = shadowNums[1] || 0;
      }
    }

    ctx2d.drawImage(capturedCanvas, pad, pad);
  }

  return { canvas: paddedCanvas, pad };
};

export const startCloseEffect = async (
  componentWindow: HTMLElement,
  onCaptured: () => void
): Promise<void> => {
  if (currentEffectName === "None") {
    onCaptured();
    return;
  }

  const isRandom = currentEffectName === "Random";
  const nick = isRandom ? nextRandomNick : nameToNick(currentEffectName);

  if (isRandom) {
    lastRandomNick = nick;
    nextRandomNick = pickRandomNick(nick);
  }

  const [shaders, htmlToImage] = await Promise.all([
    import("utils/closeEffectShaders"),
    getHtmlToImage(),
  ]).catch(() => [undefined, undefined] as const);
  // eslint-disable-next-line unicorn/no-useless-undefined
  const effect = await shaders?.loadEffect(nick).catch(() => undefined);

  if (!shaders || !effect?.fragmentSource || !htmlToImage) {
    onCaptured();
    return;
  }

  const { setUniformsFromGSchema } = shaders;

  const rect = componentWindow.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(componentWindow);

  // Canvas scaling
  const dpr = window.devicePixelRatio || 1;
  const scaleX: number = effect.scale || 1;
  const scaleY: number =
    effect.getScaleY?.(rect.height) ?? effect.scaleY ?? effect.scale ?? 1;
  const isMaximized =
    rect.left <= 1 && rect.top <= 1 && rect.right >= window.innerWidth - 1;

  let capturedCanvas: HTMLCanvasElement;

  // Detect skin frame borders (::before has actual background images, not all "none")
  const beforeCs = window.getComputedStyle(componentWindow, "::before");
  const beforeBg = beforeCs.backgroundImage || "";
  const hasSkinFrame = beforeBg.split(",").some((s) => s.trim() !== "none");

  // Calculate how far the ::before frame extends outside the element (outset frames)
  const framePad = hasSkinFrame
    ? Math.ceil(
        Math.max(
          0,
          Math.abs(Math.min(0, Number.parseFloat(beforeCs.left) || 0)),
          Math.abs(Math.min(0, Number.parseFloat(beforeCs.right) || 0)),
          Math.abs(Math.min(0, Number.parseFloat(beforeCs.bottom) || 0))
        )
      ) || 1
    : 0;

  // Copy skin CSS custom properties to componentWindow so html-to-image's clone
  // inherits them (vars on document.documentElement don't reach SVG foreignObject)
  const skinVars: [string, string][] = [];

  for (const prop of document.documentElement.style) {
    if (prop.startsWith("--skin-")) {
      const value = document.documentElement.style.getPropertyValue(prop);

      skinVars.push([prop, value]);
      componentWindow.style.setProperty(prop, value);
    }
  }

  try {
    capturedCanvas = await htmlToImage.toCanvas(componentWindow, {
      filter: (element) => !(element instanceof HTMLSourceElement),
      height: Math.round(rect.height) + framePad * 2,
      skipAutoScale: true,
      style: {
        height: `${rect.height}px`,
        ...(framePad > 0 ? { margin: `${framePad}px` } : {}),
        overflow: "visible",
        transform: "none",
        width: `${rect.width}px`,
      },
      width: Math.round(rect.width) + framePad * 2,
    });
  } catch {
    onCaptured();
    return;
  } finally {
    for (const [prop] of skinVars) {
      componentWindow.style.removeProperty(prop);
    }
  }

  // Bake shadow/outline only for default theme (no skin frames).
  // Skins provide their own visual borders via ::before — captured above.
  const scaled = scaleX > 1 || scaleY > 1;
  const skipBake = isMaximized || hasSkinFrame;
  const { canvas: bakedCanvas, pad } = skipBake
    ? { canvas: capturedCanvas, pad: 0 }
    : bakeShadowAndOutline(capturedCanvas, computedStyle, scaled);

  capturedCanvas = bakedCanvas;

  // Create WebGL canvas — account for shadow/outline pad OR skin frame pad
  const canvas = document.createElement("canvas");
  const totalPad = hasSkinFrame ? framePad : pad / dpr;
  canvas.width = Math.ceil((rect.width + totalPad * 2) * scaleX * dpr);
  canvas.height = Math.ceil((rect.height + totalPad * 2) * scaleY * dpr);

  // Derive effectPad from the shader's actual content mapping to avoid rounding mismatch.
  // The shader places window content starting at pixel ceil(padFrac * cssDim - 0.5).
  const cssW = canvas.width / dpr;
  const cssH = canvas.height / dpr;
  const effectPadX = Math.ceil(((scaleX - 1) / (2 * scaleX)) * cssW - 0.5);
  const effectPadY = Math.ceil(((scaleY - 1) / (2 * scaleY)) * cssH - 0.5);
  Object.assign(canvas.style, {
    height: `${cssH}px`,
    left: `${rect.left - effectPadX - totalPad}px`,
    pointerEvents: "none",
    position: "fixed",
    top: `${rect.top - effectPadY - totalPad}px`,
    width: `${cssW}px`,
    zIndex: "10000",
  });
  canvas.setAttribute("aria-hidden", "true");

  const pointerPos: [number, number] = [
    Math.max(0, Math.min(1, (lastPointerX - rect.left) / rect.width)),
    Math.max(0, Math.min(1, (lastPointerY - rect.top) / rect.height)),
  ];

  // Setup WebGL on the detached canvas — compile shader, upload textures,
  // draw frame 0 into the offscreen buffer. Only then append to DOM so the
  // canvas appears with content already rendered (no blank flash).
  const ctx = await setupEffect(
    canvas,
    capturedCanvas,
    effect,
    pointerPos,
    scaleY,
    effectPadX + totalPad,
    isMaximized,
    setUniformsFromGSchema
  );

  if (!ctx) {
    onCaptured();
    return;
  }

  document.body.append(canvas);
  hideRealWindow(componentWindow);
  onCaptured();
  await runAnimation(ctx);

  if (isRandom) preloadNick(nextRandomNick);
};
