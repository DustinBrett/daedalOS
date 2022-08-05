import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    Sheep?: new (config: { allowPopup: string; collisionsWith: string[] }) => {
      Start: (animationXmlUrl: string) => void;
    };
  }
}

const PETS: Record<string, [string, number]> = {
  eSheep: ["/Program Files/eSheep/eSheep.xml", 75],
  neko: ["/Program Files/eSheep/neko.xml", 5],
  pingus: ["/Program Files/eSheep/pingus.xml", 20],
};

let oneSheepLaunched = false;

const pickRandomPet = (): string => {
  const petNames = Object.keys(PETS).flatMap((pet) => {
    const [, probability] = PETS[pet];

    // eslint-disable-next-line unicorn/new-for-builtins
    return Array(probability).fill(pet) as string[];
  });
  const randomPet = Math.floor(Math.random() * petNames.length);
  const [petPath] = PETS[petNames[randomPet]];

  return petPath;
};

const spawnSheep = (): Promise<void> =>
  loadFiles(["/Program Files/eSheep/eSheep.js"]).then(() => {
    if (window.Sheep) {
      const sheep = new window.Sheep({
        allowPopup: "no",
        collisionsWith: ["nav", "section"],
      });

      if (!oneSheepLaunched) {
        sheep.Start("/Program Files/eSheep/eSheep.xml");
        oneSheepLaunched = true;
      } else {
        sheep.Start(pickRandomPet());
      }
    }
  });

export default spawnSheep;
