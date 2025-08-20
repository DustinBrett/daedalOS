import { TASKBAR_HEIGHT } from "utils/constants";
import { loadFiles } from "utils/functions";

type SheepOptions = {
  allowPopup: string;
  collisionsWith: string[];
  footerMargin: number;
  spawnContainer: HTMLElement;
};

declare global {
  interface Window {
    Sheep?: new (options: SheepOptions) => {
      Start: (animationXmlUrl: string) => void;
    };
  }
}

const PETS: Record<string, [string, number]> = {
  blue_sheep: ["/Program Files/eSheep/blue_sheep.xml", 12],
  eSheep: ["/Program Files/eSheep/eSheep.xml", 12],
  fox: ["/Program Files/eSheep/fox.xml", 4],
  green_sheep: ["/Program Files/eSheep/green_sheep.xml", 12],
  mimiko: ["/Program Files/eSheep/mimiko.xml", 4],
  neko: ["/Program Files/eSheep/neko.xml", 10],
  orange_sheep: ["/Program Files/eSheep/orange_sheep.xml", 12],
  pingus: ["/Program Files/eSheep/pingus.xml", 10],
  red_sheep: ["/Program Files/eSheep/red_sheep.xml", 12],
  yellow_sheep: ["/Program Files/eSheep/yellow_sheep.xml", 12],
};

let oneSheepLaunched = false;

const pickRandomPet = (): string => {
  const petNames = Object.keys(PETS).flatMap((pet) => {
    const [, probability] = PETS[pet];

    return Array.from({ length: probability }).fill(pet) as string[];
  });
  const randomPet = Math.floor(Math.random() * petNames.length);
  const [petPath] = PETS[petNames[randomPet]];

  return petPath;
};

export const spawnSheep = (pickRandom?: boolean): Promise<void> =>
  loadFiles(["/Program Files/eSheep/eSheep.js"]).then(() => {
    if (window.Sheep) {
      const sheep = new window.Sheep({
        allowPopup: "no",
        collisionsWith: [
          "#__next main > nav", // Taskbar
          ".react-draggable section", // Windows
          "#webamp .window", // Webamp Windows
        ],
        footerMargin: TASKBAR_HEIGHT,
        spawnContainer: document.querySelector("main") as HTMLElement,
      });

      if (oneSheepLaunched || pickRandom) {
        sheep.Start(pickRandomPet());
      } else {
        oneSheepLaunched = true;
        sheep.Start("/Program Files/eSheep/eSheep.xml");
      }
    }
  });

const sheepSelector =
  "main > div[style*='z-index: 2000'] > img[src^='data:image']";

export const killSheep = (): void => {
  const firstSheep = document.querySelector(sheepSelector) as HTMLElement;

  firstSheep?.parentElement?.remove();
};

export const countSheep = (): number =>
  document.querySelectorAll(sheepSelector).length;
