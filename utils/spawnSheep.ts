import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    Sheep?: new (config: { allowPopup: string; collisionsWith: string[] }) => {
      Start: (animationXmlUrl: string) => void;
    };
  }
}

const PETS: Record<string, [string, number]> = {
  blue_sheep: ["/Program Files/eSheep/blue_sheep.xml", 15],
  eSheep: ["/Program Files/eSheep/eSheep.xml", 15],
  fox: ["/Program Files/eSheep/fox.xml", 2],
  green_sheep: ["/Program Files/eSheep/green_sheep.xml", 15],
  mimiko: ["/Program Files/eSheep/mimiko.xml", 1],
  neko: ["/Program Files/eSheep/neko.xml", 2],
  orange_sheep: ["/Program Files/eSheep/orange_sheep.xml", 15],
  pingus: ["/Program Files/eSheep/pingus.xml", 5],
  red_sheep: ["/Program Files/eSheep/red_sheep.xml", 15],
  yellow_sheep: ["/Program Files/eSheep/yellow_sheep.xml", 15],
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
        oneSheepLaunched = true;
        sheep.Start("/Program Files/eSheep/eSheep.xml");
      } else {
        sheep.Start(pickRandomPet());
      }
    }
  });

export default spawnSheep;
