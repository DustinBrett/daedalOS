import { type VantaWavesConfig } from "components/system/Desktop/Wallpapers/vantaWaves/types";

export const config: VantaWavesConfig = {
  camera: {
    far: 400,
    fov: 30,
    near: 0.1,
  },
  color: "hsl(225, 40%, 20%)",
  colorCycleSpeed: 10,
  forceAnimate: true,
  hh: 50,
  hue: 225,
  lightness: 20,
  material: {
    options: {
      fog: false,
      wireframe: false,
    },
  },
  saturation: 40,
  shininess: 35,
  waveHeight: 20,
  waveSpeed: 0.25,
  ww: 50,
};

export const disableControls = {
  gyroControls: false,
  mouseControls: false,
  mouseEase: false,
  touchControls: false,
};
