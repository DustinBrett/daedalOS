import {
  buildViewProjection,
  pointScale,
} from "components/system/Desktop/Wallpapers/Galaxy/camera";
import {
  CAMERA,
  GALAXY,
  defaultConfig,
  type GalaxyConfig,
} from "components/system/Desktop/Wallpapers/Galaxy/config";
import {
  PARTICLE_FLOATS,
  PARTICLE_STRIDE,
  generateGalaxy,
  type GalaxyLayer,
  type GalaxyLayerTarget,
} from "components/system/Desktop/Wallpapers/Galaxy/generate";

export type GalaxyRenderer = {
  destroy: () => void;
  resize: (width: number, height: number) => void;
  setTilt: (x: number, y: number) => void;
  setVisible: (visible: boolean) => void;
};

// Disk edge as a GLSL literal, the outer end of the warp's growth window
const MAX_RADIUS_GLSL = GALAXY.maxRadius.toFixed(2);

// Supernova cadence: once per cycle a hash window picks roughly one star
// of the young population to flare and decay (the real event compressed
// into wall time). Width 0.00007 selects ~1 of the ~8k young stars.
const NOVA_RATE_GLSL = (1 / 55).toFixed(6);

// Two sprite shader variants from one template: crisp (star layers) keeps
// spikes + supernovae, soft (glow/dust/nebulae) compiles those terms out -
// bit-identical there (their amplitudes are zero), but the fill-heaviest
// passes drop most of their per-fragment transcendental work.
const buildSpriteVertexShader = (crisp: boolean): string => `
attribute vec2 aCorner;
attribute vec4 aOrbit;
attribute vec4 aMotion;
attribute vec4 aColor;
uniform mat4 uViewProj;
uniform vec2 uViewport;
uniform float uTime;
uniform float uPatternRot;
uniform float uPointScale;
uniform float uAlpha;
uniform float uTwinkleAmp;
uniform float uMaxPoint;
uniform vec4 uWarp; // x: amplitude, y: cos(node), z: sin(node), w: start
${
  crisp
    ? `uniform float uSpike;
uniform float uNova;
uniform float uSpikeGate; // sprite size (device px) where spikes begin
varying float vSpike;
varying float vNova;`
    : `uniform vec2 uDepthFade; // x: camera distance, y: 1 / depth range
uniform float uDustNear;`
}
varying vec4 vColor;
varying vec2 vCoord;

void main() {
  float a = aOrbit.x;
  float phi = aOrbit.w + aMotion.x * uTime;
  float theta = aOrbit.z + uPatternRot;
  vec2 e = vec2(a * cos(phi), a * aOrbit.y * sin(phi));
  float sT = sin(theta);
  float cT = cos(theta);
  vec2 pos = vec2(cT * e.x - sT * e.y, sT * e.x + cT * e.y);
  // Integral-sign warp of the outer disk: height offset follows
  // sin(azimuth - node), growing towards the rim (Gaia DR2)
  float z = aMotion.y + uWarp.x * smoothstep(uWarp.w, ${MAX_RADIUS_GLSL}, a) *
    (pos.y * uWarp.y - pos.x * uWarp.z) / max(a, 0.2);
  vec4 clip = uViewProj * vec4(pos, z, 1.0);
${
  crisp
    ? `  // Supernova channel: each cycle a rolling hash window elects one star
  // of the layer to flare ~50x and decay over seconds
  float novaTick = uTime * ${NOVA_RATE_GLSL};
  float novaPhase = fract(novaTick);
  float novaPick = uNova * step(
    abs(fract(aMotion.w * 0.159155) - fract(floor(novaTick) * 0.618034)),
    0.00007);
  float nova = novaPick *
    smoothstep(0.0, 0.02, novaPhase) * exp(-novaPhase * 9.0);
  float sizePx = aMotion.z * (1.0 + nova * 3.0) * uPointScale /
    max(clip.w, 0.0001);`
    : `  float sizePx = aMotion.z * uPointScale / max(clip.w, 0.0001);`
}
  float fade = clamp(sizePx, 0.0, 1.0);
  float twinkle = 1.0 + uTwinkleAmp *
    sin(uTime * (1.5 + fract(aMotion.w * 0.6366) * 2.5) + aMotion.w);
  float shownSize = clamp(sizePx, 1.0, uMaxPoint);

  // Sprites are instanced quads, not points: each corner is pushed out in
  // clip space by half the sprite size. Partly off-screen sprites then clip
  // per pixel instead of vanishing once their center leaves the viewport
  // (Metal and most mobile GL drivers cull points that way), and no driver
  // point-size limit can shrink the big glow sprites
  vCoord = aCorner;
  gl_Position = clip +
    vec4(aCorner * shownSize / uViewport * clip.w, 0.0, 0.0);
${
  crisp
    ? `  // Only sprites big enough to read as saturated stars grow spikes; the
  // gate scales with resolution so hiDPI screens spike the same stars.
  // A supernova always spikes hard at peak, so the flare reads as a
  // dazzling star with a cross flare rather than a flat white ball
  vSpike = max(uSpike * clamp((shownSize / uSpikeGate - 1.0) * 1.08, 0.0, 1.0),
    uSpike * nova * 4.0);
  vNova = min(nova * 2.0, 1.0);
  vColor = vec4(aColor.rgb,
    aColor.a * uAlpha * twinkle * fade * fade * (1.0 + nova * 5.0));`
    : `  // Inclination asymmetry of extinction: dust on the near side of a tilted
  // disk blocks the light column behind it, while far-side dust is hidden
  // by the disk's own glow - the cue astronomers read to tell which edge
  // of a galaxy is closer. Near-side lanes darken more, far-side less.
  float nearness = clamp(0.5 + (uDepthFade.x - clip.w) * uDepthFade.y,
    0.0, 1.0);
  float dustBias = mix(1.0, mix(0.72, 1.28, nearness), uDustNear);

  vColor = vec4(aColor.rgb,
    aColor.a * uAlpha * twinkle * fade * fade * dustBias);`
}
}
`;

const buildSpriteFragmentShader = (crisp: boolean): string => `
precision mediump float;
varying vec4 vColor;
varying vec2 vCoord;
${crisp ? "varying float vSpike;\nvarying float vNova;" : ""}
uniform vec3 uFalloff; // x: exponent, y: exp(-exponent), z: 1/(1-y)

void main() {
  vec2 p = vCoord;
  float r2 = dot(p, p);

  if (r2 > 1.0) discard;

  float falloff = (exp(-uFalloff.x * r2) - uFalloff.y) * uFalloff.z;
${
  crisp
    ? `  // A supernova sharpens its profile (cubed falloff) so the flare shows a
  // compact saturated core with a steep skirt instead of a flat disc
  falloff = mix(falloff, falloff * falloff * falloff, vNova);
  // Four-point diffraction spikes along the screen axes, as telescope
  // spider vanes draw them on the saturated stars of NASA/ESA photographs
  float spikes = vSpike * (1.0 - r2) *
    (exp(-48.0 * p.x * p.x) + exp(-48.0 * p.y * p.y));`
    : ""
}
  // The R2 dither needs the integer pixel coordinate intact; GPUs that run
  // mediump at fp16 would collapse the fract, so the coordinate is read at
  // high precision wherever the hardware offers it
#ifdef GL_FRAGMENT_PRECISION_HIGH
  highp vec2 ditherCoord = gl_FragCoord.xy;
#else
  vec2 ditherCoord = gl_FragCoord.xy;
#endif
  float dither =
    fract(dot(ditherCoord, vec2(0.75487767, 0.56984029))) - 0.5;
  float weight =
    vColor.a * ${crisp ? "(falloff + spikes)" : "falloff"} * (1.0 + dither * 0.1);

  gl_FragColor = vec4(vColor.rgb * weight, weight);
}
`;

const COMPOSITE_VERTEX_SHADER = `
attribute vec2 aPos;
varying vec2 vUv;

void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const COMPOSITE_FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTonemap;
uniform float uAberration;

void main() {
  vec3 color;

  if (uAberration > 0.0) {
    // Residual chromatic aberration of long-exposure optics: a slight
    // radial RGB split that grows toward the frame corners, felt on the
    // nebulous glow rather than seen on the stars
    vec2 shift = (vUv - 0.5) * uAberration;

    color = vec3(
      texture2D(uTex, vUv + shift).r,
      texture2D(uTex, vUv).g,
      texture2D(uTex, vUv - shift).b);
  } else {
    color = texture2D(uTex, vUv).rgb;
  }

  // Filmic shoulder for the HDR glow: exactly linear below the knee so the
  // tuned mid-tones pass through untouched, then an exponential rolloff
  // that compresses the core's stacked brightness into a warm gradient
  // instead of letting it clip to flat white
  vec3 over = max(color - 0.6, 0.0);
  vec3 shouldered = min(color, vec3(0.6)) + 0.4 * (1.0 - exp(-over * 2.5));
  // A per-channel rolloff bleaches every overexposed texel to the same
  // white. Scaling all channels by the brightest one's rolloff keeps the
  // bulge's golden hue through the gradient, as film does, so the plateau
  // reads as glowing Population II light and only the nucleus whites out
  float peak = max(max(color.r, color.g), color.b);
  float peakShouldered =
    min(peak, 0.6) + 0.4 * (1.0 - exp(-max(peak - 0.6, 0.0) * 2.5));
  vec3 hueKept = color * (peakShouldered / max(peak, 0.0001));

  gl_FragColor =
    vec4(mix(color, mix(shouldered, hueKept, 0.6), uTonemap), 1.0);
}
`;

const FINISH_FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform float uSeed;

void main() {
  // Multiplicative finishing pass. Sensor grain rides on the signal (the
  // shot noise of a long exposure), and a gentle optical vignette eases
  // the frame corners down the way real lens flat-fields fall off -
  // multiplying means pure black stays pure black, so the sky keeps its
  // full contrast while the corners deepen and frame the galaxy
  float noise = fract(
    sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uSeed) * 43758.5453);
  float vignette = 1.0 - 0.28 * smoothstep(0.4, 0.9, length(vUv - 0.5));

  gl_FragColor = vec4(vec3(vignette * (1.0 + (noise - 0.5) * 0.07)), 1.0);
}
`;

// Radial RGB-split strength of the glow composite, in uv units at the
// frame corners (a couple of device pixels at 1080p)
const ABERRATION_STRENGTH = 0.003;

const QUALITY_FRACTIONS = [1, 0.72, 0.5, 0.32];
// Sample points on the galaxy's bounding cylinder (radius 1.45, height
// ±0.5), projected each frame to find the content's screen rectangle: the
// fullscreen composite passes are scissored to it, skipping every pixel
// where glow adds zero and dust transmits one
const BOUND_POINTS = ((): number[] => {
  const points: number[] = [];

  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;

    points.push(
      1.45 * Math.cos(angle),
      1.45 * Math.sin(angle),
      -0.5,
      1.45 * Math.cos(angle),
      1.45 * Math.sin(angle),
      0.5
    );
  }

  return points;
})();
const SIZE_REFERENCE_HEIGHT = 900;
const MIN_EFFECTIVE_FPS = 60;

type GalaxyCanvas = HTMLCanvasElement | OffscreenCanvas;

const getContext = (
  canvas: GalaxyCanvas,
  lowPower: boolean
): WebGLRenderingContext => {
  const attributes: WebGLContextAttributes = {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: lowPower ? "low-power" : "high-performance",
    preserveDrawingBuffer: false,
    stencil: false,
  };
  const context = (canvas.getContext("webgl2", attributes) ||
    canvas.getContext("webgl", attributes)) as WebGLRenderingContext | null;

  if (!context) throw new Error("Failed to getContext for Galaxy wallpaper");

  return context;
};

const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader => {
  const shader = gl.createShader(type) as WebGLShader;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
  }

  return shader;
};

const isMobileDevice = (): boolean =>
  typeof navigator === "object" &&
  /android|iphone|ipad|mobi/i.test(navigator.userAgent);

const randomSeed = (): number => Math.trunc(Math.random() * 0x7ffffffe) + 1;

// Warm cache: the worker generates the particle buffers while handling its
// "init" message, overlapping desktop startup instead of delaying the
// first rendered frame once the canvas arrives
let warmedLayers: GalaxyLayer[] | undefined;
let warmedWideGamut = false;
let warmedQuality = 0;

// Feature-detect wide gamut on the context prototypes: no throwaway canvas
// or GL context needed, so the warm-up path stays instant
const probeWideGamut = (): boolean => {
  if (typeof WebGL2RenderingContext === "function") {
    return "drawingBufferColorSpace" in WebGL2RenderingContext.prototype;
  }

  if (typeof WebGLRenderingContext === "function") {
    return "drawingBufferColorSpace" in WebGLRenderingContext.prototype;
  }

  return false;
};

export const warmGalaxy = (): void => {
  if (warmedLayers) return;

  warmedQuality = isMobileDevice() ? 0.55 : 1;
  warmedWideGamut = probeWideGamut();
  warmedLayers = generateGalaxy(warmedQuality, warmedWideGamut, randomSeed());
};

const compileProgram = (
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
  attributeNames: string[]
): WebGLProgram => {
  const program = gl.createProgram();

  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(
    program,
    compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  );
  attributeNames.forEach((name, location) =>
    gl.bindAttribLocation(program, location, name)
  );
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
  }

  return program;
};

export const createGalaxyRenderer = (
  canvas: GalaxyCanvas,
  config?: Partial<GalaxyConfig>
): GalaxyRenderer => {
  const { faceOn, speed } = { ...defaultConfig, ...config };
  const isMobile = isMobileDevice();
  // Battery devices get the low-power GPU hint; a wallpaper should never
  // spin up a discrete GPU or block thermal throttling
  const gl = getContext(canvas, isMobile);
  let wideGamut = false;

  try {
    // Wide gamut output where supported: colors are generated in Display P3,
    // giving the saturated emission hues sRGB can't reach
    if ("drawingBufferColorSpace" in gl) {
      gl.drawingBufferColorSpace = "display-p3";
      wideGamut = gl.drawingBufferColorSpace === "display-p3";
    }
  } catch {
    // Keep default sRGB drawing buffer
  }

  // A fresh seed and viewing angle every load: same galaxy physics, never
  // the exact same sky twice. Pre-warmed buffers are used when their
  // settings match the real context, then discarded so a later renderer
  // gets its own fresh sky
  const generationQuality = isMobile ? 0.55 : 1;
  const layers =
    warmedLayers &&
    warmedWideGamut === wideGamut &&
    warmedQuality === generationQuality
      ? warmedLayers
      : generateGalaxy(generationQuality, wideGamut, randomSeed());
  const azimuthStart = Math.random() * Math.PI * 2;

  warmedLayers = undefined;
  // Uniform locations absent from a variant (compiled out) resolve to null
  // and their guarded sets are skipped in the draw loop
  const createSpriteVariant = (
    crisp: boolean
  ): {
    program: WebGLProgram;
    uniforms: Record<string, WebGLUniformLocation | null>;
  } => {
    const program = compileProgram(
      gl,
      buildSpriteVertexShader(crisp),
      buildSpriteFragmentShader(crisp),
      ["aCorner", "aOrbit", "aMotion", "aColor"]
    );

    return {
      program,
      uniforms: {
        alpha: gl.getUniformLocation(program, "uAlpha"),
        depthFade: gl.getUniformLocation(program, "uDepthFade"),
        dustNear: gl.getUniformLocation(program, "uDustNear"),
        falloff: gl.getUniformLocation(program, "uFalloff"),
        maxPoint: gl.getUniformLocation(program, "uMaxPoint"),
        nova: gl.getUniformLocation(program, "uNova"),
        patternRot: gl.getUniformLocation(program, "uPatternRot"),
        pointScale: gl.getUniformLocation(program, "uPointScale"),
        spike: gl.getUniformLocation(program, "uSpike"),
        spikeGate: gl.getUniformLocation(program, "uSpikeGate"),
        time: gl.getUniformLocation(program, "uTime"),
        twinkleAmp: gl.getUniformLocation(program, "uTwinkleAmp"),
        viewProj: gl.getUniformLocation(program, "uViewProj"),
        viewport: gl.getUniformLocation(program, "uViewport"),
        warp: gl.getUniformLocation(program, "uWarp"),
      },
    };
  };
  const crispSprites = createSpriteVariant(true);
  const softSprites = createSpriteVariant(false);
  const spriteVariants = [crispSprites, softSprites];
  const compositeProgram = compileProgram(
    gl,
    COMPOSITE_VERTEX_SHADER,
    COMPOSITE_FRAGMENT_SHADER,
    ["aPos"]
  );
  const finishProgram = compileProgram(
    gl,
    COMPOSITE_VERTEX_SHADER,
    FINISH_FRAGMENT_SHADER,
    ["aPos"]
  );
  const finishSeedLocation = gl.getUniformLocation(finishProgram, "uSeed");
  const compositeUniforms = {
    aberration: gl.getUniformLocation(compositeProgram, "uAberration"),
    tonemap: gl.getUniformLocation(compositeProgram, "uTonemap"),
  };
  let activeProgram: WebGLProgram | undefined;
  const bindProgram = (program: WebGLProgram): void => {
    if (activeProgram !== program) {
      gl.useProgram(program);
      activeProgram = program;
    }
  };
  // The warp's line of nodes points a random way each load; it stays fixed
  // in space while the spiral pattern rotates through it, as the real warp
  // precesses far slower than the disk spins
  const warpNode = Math.random() * Math.PI * 2;
  const warpCos = Math.cos(warpNode);
  const warpSin = Math.sin(warpNode);

  bindProgram(compositeProgram);
  gl.uniform1i(gl.getUniformLocation(compositeProgram, "uTex"), 0);

  // Vertex state binders: native/OES vertex array objects when available,
  // otherwise a fallback that re-applies the full attribute state per draw
  const gl2 = gl as WebGL2RenderingContext;
  const isWebGL2 = typeof gl2.createVertexArray === "function";
  const vaoExtension = isWebGL2
    ? undefined
    : gl.getExtension("OES_vertex_array_object") || undefined;
  // Sprites draw as instanced quads (see the sprite vertex shader)
  const instancedExtension = isWebGL2
    ? undefined
    : gl.getExtension("ANGLE_instanced_arrays") || undefined;

  if (!isWebGL2 && !instancedExtension) {
    throw new Error("Instanced arrays unsupported for Galaxy wallpaper");
  }

  const setInstanced = (location: number): void => {
    if (isWebGL2) gl2.vertexAttribDivisor(location, 1);
    else instancedExtension?.vertexAttribDivisorANGLE(location, 1);
  };
  const drawSprites = (count: number): void => {
    if (isWebGL2) gl2.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
    else {
      instancedExtension?.drawArraysInstancedANGLE(
        gl.TRIANGLE_STRIP,
        0,
        4,
        count
      );
    }
  };
  const vertexArrays: (WebGLVertexArrayObject | WebGLVertexArrayObjectOES)[] =
    [];
  const createStateBinder = (applyState: () => void): (() => void) => {
    if (isWebGL2) {
      const vertexArray = gl2.createVertexArray();

      gl2.bindVertexArray(vertexArray);
      applyState();
      // eslint-disable-next-line unicorn/no-null
      gl2.bindVertexArray(null);
      vertexArrays.push(vertexArray);

      return () => gl2.bindVertexArray(vertexArray);
    }

    if (vaoExtension) {
      const vertexArray = vaoExtension.createVertexArrayOES();

      vaoExtension.bindVertexArrayOES(vertexArray);
      applyState();
      // eslint-disable-next-line unicorn/no-null
      vaoExtension.bindVertexArrayOES(null);
      vertexArrays.push(vertexArray);

      return () => vaoExtension.bindVertexArrayOES(vertexArray);
    }

    return applyState;
  };
  const buffers = layers.map((layer) => {
    const buffer = gl.createBuffer();
    const uploaded = layer;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, layer.data, gl.STATIC_DRAW);
    // The GPU owns the data now; release the CPU staging copy (~3MB)
    uploaded.data = new ArrayBuffer(0);

    return buffer;
  });
  // One shared quad of corners; the particle attributes advance per instance
  const cornerBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const layerBinders = layers.map((layer, index) =>
    createStateBinder(() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[index]);
      gl.enableVertexAttribArray(1);
      gl.enableVertexAttribArray(2);
      gl.enableVertexAttribArray(3);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, PARTICLE_STRIDE, 0);
      gl.vertexAttribPointer(2, 4, gl.FLOAT, false, PARTICLE_STRIDE, 16);
      gl.vertexAttribPointer(
        3,
        4,
        gl.UNSIGNED_BYTE,
        true,
        PARTICLE_STRIDE,
        PARTICLE_FLOATS * 4
      );
      setInstanced(1);
      setInstanced(2);
      setInstanced(3);
    })
  );
  const quadBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  const quadBinder = createStateBinder(() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.enableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);
    gl.disableVertexAttribArray(3);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  });

  // Reduced resolution accumulation targets for the soft glow and dust
  // layers: gaussian sprites upsample bilinearly with no visible difference,
  // while cutting the heaviest fill cost by the scale factor squared
  type RenderTarget = {
    framebuffer: WebGLFramebuffer;
    height: number;
    internalFormat: number;
    texture: WebGLTexture;
    type: number;
    width: number;
  };
  const createRenderTarget = (
    internalFormat: number,
    type: number
  ): RenderTarget => {
    const texture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return { framebuffer, height: 0, internalFormat, texture, type, width: 0 };
  };
  const sizeRenderTarget = (
    target: RenderTarget,
    toWidth: number,
    toHeight: number
  ): void => {
    const sized = target;

    sized.width = toWidth;
    sized.height = toHeight;
    gl.bindTexture(gl.TEXTURE_2D, sized.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      sized.internalFormat,
      toWidth,
      toHeight,
      0,
      gl.RGBA,
      sized.type,
      // eslint-disable-next-line unicorn/no-null
      null
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, sized.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      sized.texture,
      0
    );
  };
  // HDR glow accumulation where the hardware allows it: half-float texels
  // keep the core's stacked brightness beyond 1.0 for the filmic rolloff.
  // WebGL2 accepts either float-renderability extension (mid-range mobile
  // GPUs often expose only the half-float one); WebGL1 needs its own trio
  let glowFormat: number = gl.RGBA;
  let glowType: number = gl.UNSIGNED_BYTE;
  let glowHdr = false;

  if (isWebGL2) {
    if (
      gl.getExtension("EXT_color_buffer_float") ||
      gl.getExtension("EXT_color_buffer_half_float")
    ) {
      glowFormat = gl2.RGBA16F;
      glowType = gl2.HALF_FLOAT;
      glowHdr = true;
    }
  } else {
    const halfFloat = gl.getExtension("OES_texture_half_float");

    // Rendering into the texture needs the color-buffer extension, and the
    // bilinear upsample of the composite blit needs the linear one
    if (
      halfFloat &&
      gl.getExtension("EXT_color_buffer_half_float") &&
      gl.getExtension("OES_texture_half_float_linear")
    ) {
      glowType = halfFloat.HALF_FLOAT_OES;
      glowHdr = true;
    }
  }

  const glowTarget = createRenderTarget(glowFormat, glowType);
  const dustTarget = createRenderTarget(gl.RGBA, gl.UNSIGNED_BYTE);

  sizeRenderTarget(glowTarget, 2, 2);

  let useRenderTargets =
    gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;

  if (!useRenderTargets && glowHdr) {
    // The driver advertises float rendering but refuses the attachment:
    // fall back to the classic 8-bit glow buffer without tone mapping
    glowHdr = false;
    glowTarget.internalFormat = gl.RGBA;
    glowTarget.type = gl.UNSIGNED_BYTE;
    sizeRenderTarget(glowTarget, 2, 2);
    useRenderTargets =
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }

  // eslint-disable-next-line unicorn/no-null
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.disable(gl.DEPTH_TEST);
  // The sprite shader's own dither makes driver dithering redundant work
  gl.disable(gl.DITHER);
  gl.enable(gl.BLEND);

  let { height, width } = canvas;
  let visible = true;
  let destroyed = false;
  let frameId = 0;
  let lastFrameTime = 0;
  let previousTick = 0;
  let tickInterval = 1000 / 60;
  let ticksSinceRender = 0;
  let simTime = 0;
  let quality = 0;
  let frameTimeAverage = 1000 / 60;
  // The frame budget: vsync interval times the vsync-skip divisor
  let renderInterval = 1000 / 60;
  let framesAtQuality = 0;
  let tiltX = 0;
  let tiltY = 0;
  let smoothTiltX = 0;
  let smoothTiltY = 0;
  const canvasElement = canvas;
  // Phones sit closer to the eye, so pull back for a fuller view; the random
  // elevation stays in a band that always reads as an angled vista rather
  // than a top-down map
  const baseDistance =
    CAMERA.distance * (isMobile ? CAMERA.mobileDistanceMul : 1);
  const baseElevation = faceOn
    ? CAMERA.elevationFaceOn
    : CAMERA.elevation +
      (isMobile ? CAMERA.mobileElevationAdd : 0) +
      (Math.random() * 2 - 1) * CAMERA.elevationJitter;

  type LayerDraw = {
    binder: () => void;
    falloffCut: number;
    layer: GalaxyLayer;
    variant: typeof crispSprites;
  };

  const layerGroups: Record<GalaxyLayerTarget, LayerDraw[]> = {
    background: [],
    dust: [],
    foreground: [],
    glow: [],
    stars: [],
  };

  layers.forEach((layer, index) =>
    layerGroups[layer.target].push({
      binder: layerBinders[index],
      falloffCut: Math.exp(-layer.falloffK),
      layer,
      // Star layers with spikes or supernovae need the crisp program; every
      // other layer renders bit-identically on the cheaper soft one
      variant:
        layer.spikeAmp > 0 || layer.novaAmp > 0 ? crispSprites : softSprites,
    })
  );

  const drawGroup = (
    target: GalaxyLayerTarget,
    passScale: number,
    viewportWidth: number,
    viewportHeight: number
  ): void => {
    const fraction = QUALITY_FRACTIONS[quality];
    const alphaBoost = Math.min(1 / fraction, 2.2);
    const sizeScale = (height / SIZE_REFERENCE_HEIGHT) * passScale;
    const basePointScale = pointScale(height) * passScale;

    // Dust sprites accumulate transmittance multiplicatively: each channel
    // of dst is scaled by (1 - absorption), giving physical reddening
    gl.blendFunc(
      target === "dust" ? gl.ZERO : gl.ONE,
      target === "dust" ? gl.ONE_MINUS_SRC_COLOR : gl.ONE
    );

    for (const { binder, falloffCut, layer, variant } of layerGroups[target]) {
      const count = Math.floor(layer.count * fraction);

      if (count > 0) {
        const { uniforms } = variant;

        bindProgram(variant.program);
        binder();
        gl.uniform1f(uniforms.pointScale, basePointScale * layer.sizeMul);
        gl.uniform3f(
          uniforms.falloff,
          layer.falloffK,
          falloffCut,
          1 / (1 - falloffCut)
        );
        gl.uniform1f(uniforms.alpha, layer.alpha * alphaBoost);
        gl.uniform1f(
          uniforms.maxPoint,
          Math.max(layer.maxPointSize * sizeScale, 2)
        );
        gl.uniform2f(uniforms.viewport, viewportWidth, viewportHeight);
        gl.uniform1f(uniforms.twinkleAmp, layer.twinkleAmp);
        if (uniforms.spike) gl.uniform1f(uniforms.spike, layer.spikeAmp);
        if (uniforms.nova) gl.uniform1f(uniforms.nova, layer.novaAmp);
        if (uniforms.dustNear) {
          gl.uniform1f(uniforms.dustNear, target === "dust" ? 1 : 0);
        }
        // Only disk populations ride the warp; the spherical background
        // and near-field layers (patternMul 0) stay untouched
        gl.uniform4f(
          uniforms.warp,
          GALAXY.warpAmplitude * layer.patternMul,
          warpCos,
          warpSin,
          GALAXY.warpStart
        );
        gl.uniform1f(
          uniforms.patternRot,
          layer.patternMul * GALAXY.patternSpeed * simTime
        );
        drawSprites(count);
      }
    }
  };

  const compositeTarget = (target: RenderTarget, additive: boolean): void => {
    bindProgram(compositeProgram);
    quadBinder();
    // Glow adds light; the dust buffer holds per-channel TRANSMITTANCE, so
    // it multiplies the frame (dst *= src), dimming and reddening at once
    gl.blendFunc(additive ? gl.ONE : gl.ZERO, additive ? gl.ONE : gl.SRC_COLOR);
    // Tone mapping and lens fringing belong to the additive glow only: the
    // dust transmittance is physical data that must multiply through as-is
    gl.uniform1f(compositeUniforms.tonemap, additive && glowHdr ? 1 : 0);
    gl.uniform1f(
      compositeUniforms.aberration,
      additive ? ABERRATION_STRENGTH : 0
    );
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const adaptQuality = (frameTime: number): void => {
    // Clamped so a single page stall can't read as a slow GPU
    frameTimeAverage +=
      (Math.min(frameTime, renderInterval * 4) - frameTimeAverage) * 0.04;
    framesAtQuality += 1;

    if (framesAtQuality < 90) return;

    // Thresholds are relative to the render cadence (vsync interval times
    // the vsync-skip divisor), so 240Hz+ displays' intentional
    // every-other-vsync pacing never reads as missed frames
    if (
      frameTimeAverage > renderInterval * 1.6 &&
      quality < QUALITY_FRACTIONS.length - 1
    ) {
      quality += 1;
      framesAtQuality = 0;
    } else if (frameTimeAverage < renderInterval * 1.12 && quality > 0) {
      quality -= 1;
      framesAtQuality = 0;
    }
  };

  const renderFrame = (now: number): void => {
    if (destroyed || !visible) return;

    frameId = requestAnimationFrame(renderFrame);

    // Track the display's rAF cadence and only render on every Nth vsync,
    // keeping the effective rate at or above MIN_EFFECTIVE_FPS
    if (previousTick) {
      const tickDelta = now - previousTick;

      if (tickDelta > 0 && tickDelta < 90) {
        tickInterval += (tickDelta - tickInterval) * 0.05;
      }
    }

    previousTick = now;
    ticksSinceRender += 1;

    const renderDivisor = Math.max(
      1,
      Math.floor(1000 / tickInterval / MIN_EFFECTIVE_FPS)
    );

    if (ticksSinceRender < renderDivisor) return;

    ticksSinceRender = 0;
    renderInterval = tickInterval * renderDivisor;

    const deltaTime = lastFrameTime ? (now - lastFrameTime) / 1000 : 1 / 60;

    lastFrameTime = now;

    if (deltaTime <= 0) return;

    const clampedDelta = Math.min(deltaTime, 0.1);

    simTime += clampedDelta * speed;
    adaptQuality(deltaTime * 1000);

    const smoothing = Math.min(clampedDelta * CAMERA.smoothing, 1);

    smoothTiltX += (tiltX - smoothTiltX) * smoothing;
    smoothTiltY += (tiltY - smoothTiltY) * smoothing;

    const cameraDistance =
      baseDistance * (1 + 0.025 * Math.sin(simTime * 0.11));
    const viewProjection = buildViewProjection(
      {
        azimuth:
          azimuthStart +
          simTime * CAMERA.azimuthDriftSpeed +
          smoothTiltX * CAMERA.parallaxAzimuth,
        distance: cameraDistance,
        elevation: Math.min(
          Math.max(
            baseElevation - smoothTiltY * CAMERA.parallaxElevation,
            0.15
          ),
          1.5
        ),
        // Pan tracks the orbit: azimuth+ translates the camera along its
        // right vector (scene shifts left), elevation- lowers it (scene
        // shifts up) - both cues agreeing makes the tilt easy to follow
        panX: -smoothTiltX * CAMERA.parallaxPan,
        panY: smoothTiltY * CAMERA.parallaxPan,
      },
      width,
      height
    );

    for (const { program, uniforms } of spriteVariants) {
      bindProgram(program);
      gl.uniformMatrix4fv(uniforms.viewProj, false, viewProjection);
      gl.uniform1f(uniforms.time, simTime);

      if (uniforms.depthFade) {
        // Depth window for the dust inclination asymmetry: the disk spans
        // roughly +-0.9 view depth around the camera distance when tilted,
        // and collapses to zero face-on, where the bias neutralizes
        gl.uniform2f(uniforms.depthFade, cameraDistance, 0.55);
      }

      if (uniforms.spikeGate) {
        gl.uniform1f(
          uniforms.spikeGate,
          Math.max((9 * height) / SIZE_REFERENCE_HEIGHT, 4)
        );
      }
    }

    // Project the content bounds for the composite scissor rectangle
    let boundsMinX = width;
    let boundsMinY = height;
    let boundsMaxX = 0;
    let boundsMaxY = 0;

    for (let point = 0; point < BOUND_POINTS.length; point += 3) {
      const px = BOUND_POINTS[point];
      const py = BOUND_POINTS[point + 1];
      const pz = BOUND_POINTS[point + 2];
      const clipW =
        viewProjection[3] * px +
        viewProjection[7] * py +
        viewProjection[11] * pz +
        viewProjection[15];

      if (clipW <= 0.05) {
        boundsMinX = 0;
        boundsMinY = 0;
        boundsMaxX = width;
        boundsMaxY = height;
        break;
      }

      const screenX =
        (((viewProjection[0] * px +
          viewProjection[4] * py +
          viewProjection[8] * pz +
          viewProjection[12]) /
          clipW) *
          0.5 +
          0.5) *
        width;
      const screenY =
        (((viewProjection[1] * px +
          viewProjection[5] * py +
          viewProjection[9] * pz +
          viewProjection[13]) /
          clipW) *
          0.5 +
          0.5) *
        height;

      boundsMinX = Math.min(boundsMinX, screenX);
      boundsMinY = Math.min(boundsMinY, screenY);
      boundsMaxX = Math.max(boundsMaxX, screenX);
      boundsMaxY = Math.max(boundsMaxY, screenY);
    }

    const boundsMargin = height * 0.08 + 16;
    const scissorX = Math.max(0, Math.floor(boundsMinX - boundsMargin));
    const scissorY = Math.max(0, Math.floor(boundsMinY - boundsMargin));
    const scissorWidth = Math.min(
      width - scissorX,
      Math.ceil(boundsMaxX + boundsMargin) - scissorX
    );
    const scissorHeight = Math.min(
      height - scissorY,
      Math.ceil(boundsMaxY + boundsMargin) - scissorY
    );

    if (useRenderTargets) {
      // Struggling GPUs get an extra lever before particles are thinned.
      // The soft glow needs no more than ~620 rows regardless of canvas
      // resolution, so hiDPI backing stores don't inflate the blur buffers
      const targetScale = Math.min(quality >= 2 ? 0.3 : 0.45, 620 / height);
      const targetWidth = Math.max(1, Math.ceil(width * targetScale));
      const targetHeight = Math.max(1, Math.ceil(height * targetScale));

      if (
        glowTarget.width !== targetWidth ||
        glowTarget.height !== targetHeight
      ) {
        sizeRenderTarget(glowTarget, targetWidth, targetHeight);
        sizeRenderTarget(dustTarget, targetWidth, targetHeight);
      }

      gl.viewport(0, 0, targetWidth, targetHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, glowTarget.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
      drawGroup("glow", targetScale, targetWidth, targetHeight);
      // Dust starts fully transparent: transmittance 1 in every channel
      gl.clearColor(1, 1, 1, 1);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dustTarget.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
      drawGroup("dust", targetScale, targetWidth, targetHeight);
      // eslint-disable-next-line unicorn/no-null
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    gl.viewport(0, 0, width, height);
    // The sky stays essentially black - just the faintest blue bias so the
    // darkest tones lean cold rather than gray. Deep contrast against the
    // dark panel is the look; a lifted navy floor reads as gray haze
    gl.clearColor(0.0012, 0.0018, 0.005, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawGroup("background", 1, width, height);

    if (useRenderTargets) {
      // Everything between the blits lives inside the content bounds, so
      // the scissor can stay on across the whole section
      if (scissorWidth > 0 && scissorHeight > 0) {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(scissorX, scissorY, scissorWidth, scissorHeight);
      }

      compositeTarget(glowTarget, true);
      drawGroup("stars", 1, width, height);
      compositeTarget(dustTarget, false);
      gl.disable(gl.SCISSOR_TEST);
    } else {
      drawGroup("glow", 1, width, height);
      drawGroup("stars", 1, width, height);
      drawGroup("dust", 1, width, height);
    }

    drawGroup("foreground", 1, width, height);

    // Final full-frame finishing multiply (grain + vignette). Always on:
    // it costs one cheap fullscreen quad, and gating it on the quality
    // governor would make the whole frame visibly pop when tiers change
    bindProgram(finishProgram);
    quadBinder();
    gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
    gl.uniform1f(finishSeedLocation, (simTime * 61.8) % 97);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const start = (): void => {
    lastFrameTime = 0;
    previousTick = 0;
    ticksSinceRender = 0;
    frameId = requestAnimationFrame(renderFrame);
  };

  start();

  return {
    destroy: () => {
      destroyed = true;

      cancelAnimationFrame(frameId);

      // Everything is already gone, and loseContext would kill the restore
      if (gl.isContextLost()) return;

      vertexArrays.forEach((vertexArray) => {
        if (isWebGL2) gl2.deleteVertexArray(vertexArray);
        else vaoExtension?.deleteVertexArrayOES(vertexArray);
      });
      buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      gl.deleteBuffer(quadBuffer);
      gl.deleteBuffer(cornerBuffer);
      [glowTarget, dustTarget].forEach((target) => {
        gl.deleteFramebuffer(target.framebuffer);
        gl.deleteTexture(target.texture);
      });
      gl.deleteProgram(crispSprites.program);
      gl.deleteProgram(softSprites.program);
      gl.deleteProgram(compositeProgram);
      gl.deleteProgram(finishProgram);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
    resize: (newWidth, newHeight) => {
      width = Math.max(1, Math.floor(newWidth));
      height = Math.max(1, Math.floor(newHeight));
      canvasElement.width = width;
      canvasElement.height = height;
    },
    setTilt: (x, y) => {
      tiltX = Math.min(Math.max(x, -1), 1);
      tiltY = Math.min(Math.max(y, -1), 1);
    },
    setVisible: (newVisible) => {
      if (visible === newVisible || destroyed) return;

      visible = newVisible;

      if (visible) start();
      else cancelAnimationFrame(frameId);
    },
  };
};
