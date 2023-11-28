import { type VantaNetConfig } from "components/system/Desktop/Wallpapers/vantaNet/types";

export const config: VantaNetConfig = {
  backgroundColor: "hsl(0, 0%, 16%)",
  color: "#83a598",
  forceAnimate: true,
  hh: 50,
  material: {
    options: {
      fog: false,
      wireframe: false,
    },
  },
  maxDistance: 20,
  points: 10,
  showDots: true,
  spacing: 15,
  ww: 50,
};

export const disableControls = {
  gyroControls: false,
  mouseControls: true,
  mouseEase: true,
  touchControls: true,
};

export const libs = [
  "/System/Vanta.js/three.min.js",
  "/System/Vanta.js/vanta.net.min.js",
];
