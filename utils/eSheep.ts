import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    Sheep?: new (config: { allowPopup: string; collisionsWith: string[] }) => {
      Start: (animationXmlUrl: string) => void;
    };
  }
}

const spawnSheep = (): Promise<void> =>
  loadFiles(["/Program Files/eSheep/eSheep.js"]).then(() => {
    if (window.Sheep) {
      const sheep = new window.Sheep({
        allowPopup: "no",
        collisionsWith: ["nav", "section"],
      });
      sheep.Start("/Program Files/eSheep/animations.xml");
    }
  });

export default spawnSheep;
