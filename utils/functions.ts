import { stripUnit } from "polished";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

export const bufferToBlob = (buffer: Buffer): Blob =>
  new Blob([new Uint8Array(buffer)]);

export const bufferToUrl = (buffer: Buffer): string =>
  URL.createObjectURL(bufferToBlob(buffer));

export const cleanUpBufferUrl = (url: string): void => URL.revokeObjectURL(url);

export const loadScript = (src: string): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedScripts = [...document.scripts];

    if (loadedScripts.some((script) => script.src.endsWith(src))) {
      resolve(new Event("Already loaded."));
    } else {
      const script = document.createElement("script");

      script.async = false;
      script.src = src;
      script.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
      script.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

      document.head.appendChild(script);
    }
  });

export const loadFiles = async (files: string[]): Promise<Event[]> =>
  Promise.all(files.map((file) => loadScript(file)));

export const pxToNum = (value: string | number = 0): number =>
  Number(stripUnit(value));
