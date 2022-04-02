export const config = {
  camera: {
    far: 400,
    fov: 30,
    near: 0.1,
  },
  color: 0x192b34,
  colorCycleSpeed: 5,
  forceAnimate: true,
  hh: 50,
  hue: 200,
  lightness: 15,
  material: {
    options: {
      wireframe: false,
    },
  },
  saturation: 35,
  shininess: 35,
  waveHeight: 15,
  waveSpeed: 0.25,
  ww: 50,
};

export const disableControls = {
  gyroControls: false,
  mouseControls: false,
  mouseEase: false,
  touchControls: false,
};

export const isWebGLAvailable = typeof WebGLRenderingContext !== "undefined";

export const libs = [
  "/System/Vanta.js/three.min.js",
  "/System/Vanta.js/vanta.waves.min.js",
];
