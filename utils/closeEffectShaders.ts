import commonGlsl from "Burn-My-Windows/resources/shaders/common.glsl";
import gschemaXml from "Burn-My-Windows/schemas/org.gnome.shell.extensions.burn-my-windows-profile.gschema.xml";
import { nickToName, type ShaderEffect } from "utils/closeEffect";

// Extract shared utility functions from common.glsl (after the platform #endif)
const extractCommonUtils = (source: string): string => {
  const endifPattern = /#endif\s*\/\/\s*-+/g;
  let lastEndifIndex = 0;
  let match = endifPattern.exec(source);

  while (match) {
    lastEndifIndex = match.index + match[0].length;
    match = endifPattern.exec(source);
  }

  return lastEndifIndex > 0 ? source.slice(lastEndifIndex) : "";
};

const WEBGL_PREAMBLE = `
  #extension GL_OES_standard_derivatives : warn
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  varying vec2 vTexCoord;
  uniform sampler2D uTexture;

  uniform bool uForOpening;
  uniform float uProgress;
  uniform float uDuration;

  #define iTexCoord vTexCoord

  uniform vec2 uSize;
  uniform float uPadding;
  uniform bool uIsFullscreen;

  // Branchless bounds check — returns transparent for out-of-range coords
  // (matching BMW's CLAMP_TO_EDGE behavior for the window content area).
  // Avoids GPU warp divergence on scaled effects where most fragments are
  // outside the window (e.g. broken-glass 2x: 75% out-of-bounds).
  vec4 getInputColor(vec2 coords) {
    float inBounds = step(0.0, coords.x) * step(coords.x, 1.0) *
                     step(0.0, coords.y) * step(coords.y, 1.0);
    return texture2D(uTexture, clamp(coords, 0.0, 1.0)) * inBounds;
  }

  void setOutputColor(vec4 outColor) {
    gl_FragColor = vec4(outColor.rgb * outColor.a, outColor.a);
  }
`;

const COMMON_UTILS = extractCommonUtils(commonGlsl).replace(
  /vec4 getBlurredInputColor\([^)]*\)\s*\{[\s\S]+?\n\}/,
  "vec4 getBlurredInputColor(vec2 uv, float r, float s) { return getInputColor(uv); }"
);

const buildShader = (fragSource: string): string => {
  // Fix GLSL ES 1.0 incompatibilities in BMW shaders (which target GLSL 3.x):
  // 1. Integer literals passed to float params: fn(x, 4) → fn(x, 4.0)
  // 2. Non-constant array indices: [int(uniform)] → workaround with if-chain
  // 3. Non-constant loop bounds: i < uniform → i < CONST (hardcode max)
  const patched = fragSource
    // Fix int literals in function calls: (value, 4) → (value, 4.0)
    // Group 2 is \d+ (pure digits only) so always needs .0 suffix.
    .replace(/\(([^,()]+),\s*(\d+)\s*\)/g, "($1, $2.0)")
    // Fix non-constant loop bounds: GLSL ES 1.0 requires constant loop conditions.
    // Use a constant cap with an early `break` on the actual uniform value so the
    // loop runs exactly the right count regardless of the default.
    .replace(
      /for\s*\(\s*float\s+(\w+)\s*=\s*[\d.]+\s*;\s*\1\s*<\s*(u\w+)\s*;\s*\+\+\1\s*\)\s*\{/g,
      "for (float $1 = 0.0; $1 < 10.0; ++$1) { if ($1 >= $2) break;"
    )
    // Fix non-constant array index: [int(uBrushSize - 1.0)] → if-chain
    .replace(
      /texture2D\(uBrushTexture,\s*texCoord\)\[int\(uBrushSize\s*-\s*1\.0\)\]/g,
      "(uBrushSize < 1.5 ? texture2D(uBrushTexture, texCoord).r : uBrushSize < 2.5 ? texture2D(uBrushTexture, texCoord).g : texture2D(uBrushTexture, texCoord).b)"
    )
    // Clamp aspect >= 1.0 so sparkle/effects aren't compressed on portrait windows
    .replace(
      /float\s+aspect\s*=\s*uSize\.x\s*\/\s*uSize\.y\s*;/g,
      "float aspect = max(1.0, uSize.x / uSize.y);"
    )
    // Fix pow(negative, y) → NaN on mobile GPUs (GLSL spec: undefined for x<0).
    // TeamRocket's fadeInOut computes pow((t-0.5)/0.5, power) which is negative
    // for t<0.5, killing 3 of 4 sparkle quadrants. abs() is safe since power
    // is always even (2, 4, 8).
    .replace(
      /pow\(\(t\s*-\s*0\.5\)\s*\/\s*\(0\.5\),\s*power\)/g,
      "pow(abs((t - 0.5) / 0.5), power)"
    )
    // Strip #ifndef GL_ES / #endif guards — we enable OES_standard_derivatives
    // so dFdx/dFdy work in WebGL (T-Rex scratch folds, Incinerate shimmer)
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    .replace(/#ifndef GL_ES\s*([\s\S]*?)\s*#endif/g, "$1");

  // BMW adds trailing newline: "Else the GLSL compiler complains..." (Shader.js:229)
  return `${WEBGL_PREAMBLE}\n${COMMON_UTILS}\n${patched}\n`;
};

// ─── GSchema Default Values ─────────────────────────────────────────────────

type GSchemaEntry = { defaultValue: string; type: string };

const parseGSchema = (xml: string): Record<string, GSchemaEntry> => {
  const defaults: Record<string, GSchemaEntry> = {};
  const keyPattern =
    /<key\s+name="([^"]+)"\s+type="([^"]+)">\s*<default>([^<]*)<\/default>/g;
  let keyMatch = keyPattern.exec(xml);

  while (keyMatch) {
    defaults[keyMatch[1]] = { defaultValue: keyMatch[3], type: keyMatch[2] };
    keyMatch = keyPattern.exec(xml);
  }

  return defaults;
};

const GSCHEMA_DEFAULTS = parseGSchema(gschemaXml);

// Parse a CSS color string like "rgba(76, 51, 25, 0.0)" or "rgb(255, 200, 50)"
const parseColor = (colorStr: string): number[] => {
  const cleaned = colorStr.replace(/["']/g, "");
  const colorMatch = /rgba?\(([^)]+)\)/.exec(cleaned);

  if (!colorMatch) return [1, 1, 1, 1];

  const parts = colorMatch[1]
    .split(",")
    .map((s) => Number.parseFloat(s.trim()));

  return [
    (parts[0] || 0) / 255,
    (parts[1] || 0) / 255,
    (parts[2] || 0) / 255,
    parts.length > 3 ? (parts[3] ?? 1) : 1,
  ];
};

// ─── Generic Uniform Setter ─────────────────────────────────────────────────

const STANDARD_UNIFORMS = new Set([
  "uDuration",
  "uForOpening",
  "uIsFullscreen",
  "uPadding",
  "uProgress",
  "uSize",
  "uTexture",
]);

const uniformToKeySuffix = (name: string): string =>
  name
    .replace(/^u/, "")
    .replace(/([a-z])(\d)/g, "$1-$2")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

const UNIFORM_KEY_OVERRIDES: Record<string, Record<string, string>> = {
  "broken-glass": {
    uShardScale: "scale",
  },
  fire: {
    u3DNoise: "3d-noise",
    uGradient1: "color-1",
    uGradient2: "color-2",
    uGradient3: "color-3",
    uGradient4: "color-4",
    uGradient5: "color-5",
  },
  matrix: {
    uLetterSize: "scale",
    uOverShoot: "overshoot",
  },
  "paint-brush": {
    uBrushSize: "size",
  },
  snap: {
    uDustColor: "color",
    uDustScale: "scale",
  },
  trex: {
    uClawSize: "scratch-scale",
    uFlashColor: "scratch-color",
    uNumClaws: "scratch-count",
    uWarpIntensity: "scratch-warp",
  },
  tv: { uColor: "effect-color" },
};

const setUniformsFromGSchema = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  nick: string,
  width: number,
  height: number,
  durationMs: number,
  pointerPos: [number, number] = [0.5, 0.5],
  actorScaleY = 1
): void => {
  gl.uniform2f(gl.getUniformLocation(program, "uSize"), width, height);
  gl.uniform1f(gl.getUniformLocation(program, "uDuration"), durationMs / 1000);

  const uniformCount = gl.getProgramParameter(
    program,
    gl.ACTIVE_UNIFORMS
  ) as number;

  const setRuntimeUniform = (
    loc: WebGLUniformLocation,
    info: WebGLActiveInfo
  ): void => {
    if (info.name === "uSeed") {
      if (info.type === gl.FLOAT) gl.uniform1f(loc, Math.random());
      else if (info.type === gl.FLOAT_VEC2) {
        gl.uniform2f(loc, Math.random(), Math.random());
      }
    } else if (info.name === "uEpicenter") {
      // BMW's BrokenGlass defaults epicenter to window center (0.5, 0.5)
      const usePointer =
        GSCHEMA_DEFAULTS[`${nick}-use-pointer`]?.defaultValue === "true";
      const [x, y] = usePointer ? pointerPos : [0.5, 0.5];

      gl.uniform2f(loc, x, y);
    } else if (info.name === "uStartPos") {
      // pixel-wipe always uses pointer; incinerate checks gschema
      const usePointer =
        nick === "pixel-wipe" ||
        GSCHEMA_DEFAULTS[`${nick}-use-pointer`]?.defaultValue === "true";

      if (usePointer) {
        gl.uniform2f(loc, pointerPos[0], pointerPos[1]);
      } else {
        // Random position on a window edge (BMW Incinerate behavior)
        const s0 = Math.random();
        const s1 = Math.random();

        gl.uniform2f(
          loc,
          s0 > s1 ? s0 : Math.round(s0),
          s0 > s1 ? Math.round(s1) : s1
        );
      }
    } else if (info.name === "uActorScale") {
      gl.uniform1f(loc, actorScaleY);
    }
  };

  const setGSchemaUniform = (
    loc: WebGLUniformLocation,
    info: WebGLActiveInfo,
    entry: GSchemaEntry
  ): void => {
    const { defaultValue, type } = entry;

    switch (type) {
      case "b":
        gl.uniform1i(loc, defaultValue === "true" ? 1 : 0);
        break;
      case "d":
        gl.uniform1f(loc, Number.parseFloat(defaultValue));
        break;
      case "i":
        if (info.type === gl.FLOAT) {
          gl.uniform1f(loc, Number.parseInt(defaultValue, 10));
        } else {
          gl.uniform1i(loc, Number.parseInt(defaultValue, 10));
        }
        break;
      case "s": {
        const color = parseColor(defaultValue);

        if (info.type === gl.FLOAT_VEC4) {
          gl.uniform4f(loc, color[0], color[1], color[2], color[3]);
        } else if (info.type === gl.FLOAT_VEC3) {
          gl.uniform3f(loc, color[0], color[1], color[2]);
        }
        break;
      }
      default:
        break;
    }
  };

  const overrides = UNIFORM_KEY_OVERRIDES[nick];

  for (let i = 0; i < uniformCount; i++) {
    const info = gl.getActiveUniform(program, i);

    if (info && !STANDARD_UNIFORMS.has(info.name)) {
      const location = gl.getUniformLocation(program, info.name);

      if (location) {
        const keySuffix =
          overrides?.[info.name] || uniformToKeySuffix(info.name);
        const entry = GSCHEMA_DEFAULTS[`${nick}-${keySuffix}`];

        if (entry) {
          setGSchemaUniform(location, info, entry);
        } else if (!info.name.includes("Texture")) {
          setRuntimeUniform(location, info);
        }
      }
    }
  }
};

// ─── BMW Texture Loader ─────────────────────────────────────────────────────

const BMW_TEXTURE_PATH = "/System/BMW";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

const loadImage = (url: string): Promise<HTMLImageElement> => {
  const cached = imageCache.get(url);

  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = url;
  }).catch((error: unknown) => {
    imageCache.delete(url);
    throw error;
  });

  imageCache.set(url, promise);

  return promise;
};

const loadBMWTexture = async (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  uniformName: string,
  filename: string,
  textureUnit: number
): Promise<void> => {
  let img: HTMLImageElement;

  try {
    img = await loadImage(`${BMW_TEXTURE_PATH}/${filename}`);
  } catch {
    return;
  }

  const location = gl.getUniformLocation(program, uniformName);
  const tex = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  const glError = gl.getError();

  if (glError !== gl.NO_ERROR) {
    console.error(`[BMW] GL error ${glError} uploading ${uniformName}`);
  }

  gl.uniform1i(location, textureUnit);
  gl.activeTexture(gl.TEXTURE0);
};

// ─── Effect Registry ────────────────────────────────────────────────────────

// Effect metadata — no shader sources, just configuration.
// Each frag file is dynamically imported only when its effect is selected.
type EffectMeta = {
  getScaleY?: (windowHeight: number) => number;
  scale?: number;
  scaleY?: number;
  textureFile?: string;
  textureUniform?: string;
  uniformOverrides?: Record<string, number>;
};

const EFFECT_META: Record<string, EffectMeta> = {
  "broken-glass": {
    scale: 2,
    textureFile: "shards.png",
    textureUniform: "uShardTexture",
  },
  doom: {
    getScaleY: (windowHeight: number) =>
      2 * Math.max(1, window.innerHeight / windowHeight),
  },
  matrix: {
    scaleY: 1.25,
    textureFile: "matrixFont.png",
    textureUniform: "uFontTexture",
  },
  "paint-brush": {
    textureFile: "brush.png",
    textureUniform: "uBrushTexture",
  },
  snap: {
    scale: 1.2,
    textureFile: "dust.png",
    textureUniform: "uDustTexture",
  },
  trex: {
    scale: 1.075,
    textureFile: "claws.png",
    textureUniform: "uClawTexture",
  },
};

// Dynamic frag loaders — each creates its own webpack chunk.
// Only the selected effect's .frag file is loaded.
const FRAG_LOADERS: Record<string, () => Promise<string>> = {
  "broken-glass": () =>
    import("Burn-My-Windows/resources/shaders/broken-glass.frag").then(
      (m) => m.default
    ),
  doom: () =>
    import("Burn-My-Windows/resources/shaders/doom.frag").then(
      (m) => m.default
    ),
  "energize-a": () =>
    import("Burn-My-Windows/resources/shaders/energize-a.frag").then(
      (m) => m.default
    ),
  "energize-b": () =>
    import("Burn-My-Windows/resources/shaders/energize-b.frag").then(
      (m) => m.default
    ),
  fire: () =>
    import("Burn-My-Windows/resources/shaders/fire.frag").then(
      (m) => m.default
    ),
  glitch: () =>
    import("Burn-My-Windows/resources/shaders/glitch.frag").then(
      (m) => m.default
    ),
  hexagon: () =>
    import("Burn-My-Windows/resources/shaders/hexagon.frag").then(
      (m) => m.default
    ),
  incinerate: () =>
    import("Burn-My-Windows/resources/shaders/incinerate.frag").then(
      (m) => m.default
    ),
  matrix: () =>
    import("Burn-My-Windows/resources/shaders/matrix.frag").then(
      (m) => m.default
    ),
  "paint-brush": () =>
    import("Burn-My-Windows/resources/shaders/paint-brush.frag").then(
      (m) => m.default
    ),
  "pixel-wipe": () =>
    import("Burn-My-Windows/resources/shaders/pixel-wipe.frag").then(
      (m) => m.default
    ),
  pixelate: () =>
    import("Burn-My-Windows/resources/shaders/pixelate.frag").then(
      (m) => m.default
    ),
  portal: () =>
    import("Burn-My-Windows/resources/shaders/portal.frag").then(
      (m) => m.default
    ),
  rgbwarp: () =>
    import("Burn-My-Windows/resources/shaders/rgbwarp.frag").then(
      (m) => m.default
    ),
  snap: () =>
    import("Burn-My-Windows/resources/shaders/snap.frag").then(
      (m) => m.default
    ),
  "team-rocket": () =>
    import("Burn-My-Windows/resources/shaders/team-rocket.frag").then(
      (m) => m.default
    ),
  trex: () =>
    import("Burn-My-Windows/resources/shaders/trex.frag").then(
      (m) => m.default
    ),
  tv: () =>
    import("Burn-My-Windows/resources/shaders/tv.frag").then((m) => m.default),
  wisps: () =>
    import("Burn-My-Windows/resources/shaders/wisps.frag").then(
      (m) => m.default
    ),
};

const getDuration = (nick: string): number => {
  const entry = GSCHEMA_DEFAULTS[`${nick}-animation-time`];

  return entry ? Number.parseInt(entry.defaultValue, 10) : 1000;
};

// Cache effect promises so concurrent calls share a single load.
const effectCache = new Map<string, Promise<ShaderEffect>>();

// Load a single effect by nick — dynamically imports only that .frag file.
export const loadEffect = (nick: string): Promise<ShaderEffect> => {
  const cached = effectCache.get(nick);

  if (cached) return cached;

  const loader = FRAG_LOADERS[nick];

  if (!loader) {
    return Promise.resolve({
      duration: 250,
      fragmentSource: "",
      name: "None",
      nick: "none",
    });
  }

  const promise = loader()
    .then((fragSource) => {
      const meta = EFFECT_META[nick] || {};
      const { textureFile, textureUniform } = meta;

      return {
        duration: getDuration(nick),
        fragmentSource: fragSource ? buildShader(fragSource) : "",
        getScaleY: meta.getScaleY,
        name: nickToName(nick),
        nick,
        scale: meta.scale,
        scaleY: meta.scaleY,
        setupTextures:
          textureFile && textureUniform
            ? (gl: WebGLRenderingContext, program: WebGLProgram) =>
                loadBMWTexture(gl, program, textureUniform, textureFile, 1)
            : undefined,
        uniformOverrides: meta.uniformOverrides,
      };
    })
    .catch((error: unknown) => {
      effectCache.delete(nick);
      throw error;
    });

  effectCache.set(nick, promise);

  return promise;
};

// Preload shader + textures for an effect so close-time is instant.
export const preloadEffect = (nick: string): void => {
  loadEffect(nick);

  const texture = EFFECT_META[nick]?.textureFile;

  if (texture) {
    loadImage(`${BMW_TEXTURE_PATH}/${texture}`).catch(() => {
      // Ignore texture load errors during preloading; we'll handle them gracefully at runtime.
    });
  }
};

export { setUniformsFromGSchema };
