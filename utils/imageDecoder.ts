import {
  TIFF_IMAGE_FORMATS,
  HEIF_IMAGE_FORMATS,
  ONE_TIME_PASSIVE_EVENT,
} from "utils/constants";
import { decodeQoi } from "components/apps/Photos/qoi";
import {
  blobToBuffer,
  bufferToUrl,
  cleanUpBufferUrl,
  getExtension,
  getGifJs,
  getMimeType,
  imgDataToBuffer,
} from "utils/functions";

type JxlDecodeResponse = { data: { imgData: ImageData } };

const JIFFIES_IN_SECOND = 60;
const DEFAULT_JIFFY_RATE = 10;

const supportsImageType = async (type: string): Promise<boolean> => {
  const img = document.createElement("img");

  document.createElement("picture").append(
    Object.assign(document.createElement("source"), {
      srcset: "data:,x",
      type,
    }),
    img
  );

  await new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });

  return typeof img.currentSrc === "string" && img.currentSrc.length > 0;
};

const decodeJxl = async (image: Buffer): Promise<Buffer> =>
  (await supportsImageType("image/jxl"))
    ? image
    : new Promise((resolve) => {
        const worker = new Worker("System/JXL.js/jxl_dec.js", {
          name: "JXL.js",
        });

        worker.postMessage({ image, jxlSrc: "image.jxl" });
        worker.addEventListener("message", (message: JxlDecodeResponse) => {
          resolve(imgDataToBuffer(message?.data?.imgData));
          worker.terminate();
        });
      });

const decodeHeic = async (image: Buffer): Promise<Buffer> => {
  if (await supportsImageType("image/heic")) return image;

  return new Promise((resolve) => {
    const worker = new Worker(new URL("utils/heic.worker", import.meta.url), {
      name: "libheif",
    });

    worker.postMessage(image);
    worker.addEventListener(
      "message",
      ({ data: imageData }: { data: ImageData }) => {
        resolve(imgDataToBuffer(imageData));
        worker.terminate();
      }
    );
  });
};

const aniToGif = async (aniBuffer: Buffer): Promise<Buffer> => {
  const gif = await getGifJs();
  const { parseAni } = await import("ani-cursor/dist/parser");
  let images: Uint8Array[] = [];
  let metadata: { iDispRate?: number } = {};

  try {
    ({ images, metadata } = parseAni(aniBuffer));
  } catch {
    return aniBuffer;
  }

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          const imageIcon = new Image();
          const bufferUrl = bufferToUrl(Buffer.from(image));
          gif.setOptions({ transparent: "" });
          imageIcon.addEventListener(
            "load",
            () => {
              gif.addFrame(imageIcon, {
                delay:
                  ((metadata.iDispRate || DEFAULT_JIFFY_RATE) /
                    JIFFIES_IN_SECOND) *
                  1000,
              });
              cleanUpBufferUrl(bufferUrl);
              resolve();
            },
            ONE_TIME_PASSIVE_EVENT
          );
          imageIcon.src = bufferUrl;
        })
    )
  );

  return new Promise((resolve) => {
    gif
      .on("finished", (blob) => {
        blobToBuffer(blob).then(resolve);
        gif.freeWorkers.forEach((worker) => worker?.terminate());
      })
      .render();
  });
};

export const getFirstAniImage = async (
  imageBuffer: Buffer
): Promise<Buffer | undefined> => {
  const { parseAni } = await import("ani-cursor/dist/parser");
  let firstImage: Uint8Array;

  try {
    ({
      images: [firstImage],
    } = parseAni(imageBuffer));

    return Buffer.from(firstImage);
  } catch {
    // Can't parse ani
  }

  return undefined;
};

const getGlobalCursorCSS = (cursorUrl: string): string =>
  `*, *::before, *::after { cursor: url(${cursorUrl}), default !important; }`;

const aniToCss = async (
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> => {
  const { parseAni } = await import("ani-cursor/dist/parser");
  const { metadata, images } = parseAni(imageBuffer);
  const toUrl = (image: Uint8Array): string =>
    bufferToUrl(Buffer.from(image), mimeType);

  if (images.length === 1) return getGlobalCursorCSS(toUrl(images[0]));

  if (images.length > 1) {
    const animationName = `cursor-ani-${Date.now()}`;
    const keyframes = `
      @keyframes ${animationName} {
        ${images
          .map(
            (image, i) =>
              `${((i / images.length) * 100).toFixed(1)}% { cursor: url(${toUrl(image)}), default; }`
          )
          .join("")}
        100% { cursor: url(${toUrl(images[0])}), default; }
      }
    `;
    const duration = Math.ceil(
      ((metadata.iDispRate || DEFAULT_JIFFY_RATE) / JIFFIES_IN_SECOND) *
        images.length *
        1000
    );

    return `${keyframes}* { animation: ${animationName} ${duration}ms infinite steps(1) !important; }`;
  }

  return "";
};

const getLargestIcon = async (
  imageBuffer: Buffer,
  maxSize: number
): Promise<string> => {
  try {
    const { default: icoData } = await import("decode-ico");
    const [icon] = icoData(imageBuffer)
      .filter(({ width }) => width <= maxSize)
      .sort((a, b) => b.width - a.width);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", {
      desynchronized: true,
    });

    canvas.width = icon.width;
    canvas.height = icon.height;
    context?.putImageData(icon as unknown as ImageData, 0, 0);

    return canvas.toDataURL();
  } catch {
    return "";
  }
};

export const cursorToCss = async (
  buffer: Buffer,
  path: string
): Promise<string> => {
  if (getExtension(path) === ".ani") {
    const animatedCursorCss = await aniToCss(buffer, getMimeType(path));

    if (animatedCursorCss) return animatedCursorCss;
  }

  const largestIcon = await getLargestIcon(buffer, 128);

  return getGlobalCursorCSS(
    largestIcon || bufferToUrl(buffer, getMimeType(path))
  );
};

const canLoadNative = async (
  extension: string,
  file: Buffer
): Promise<boolean> =>
  new Promise((resolve) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(true), ONE_TIME_PASSIVE_EVENT);
    image.addEventListener(
      "error",
      () => resolve(false),
      ONE_TIME_PASSIVE_EVENT
    );

    image.src = bufferToUrl(file, getMimeType("", extension));
  });

export const decodeImageToBuffer = async (
  extension: string,
  file: Buffer
): Promise<Buffer | undefined> => {
  switch (extension) {
    case ".jxl":
      return decodeJxl(file);
    case ".qoi":
      return decodeQoi(file);
    case ".ani":
      try {
        return await aniToGif(file);
      } catch {
        return getFirstAniImage(file);
      }
    case ".cur":
      return (await canLoadNative(extension, file))
        ? file
        : getFirstAniImage(file);
    default:
      if (HEIF_IMAGE_FORMATS.has(extension)) return decodeHeic(file);
      if (TIFF_IMAGE_FORMATS.has(extension)) {
        return Buffer.from(
          (await import("utif"))
            .bufferToURI(file)
            .replace("data:image/png;base64,", ""),
          "base64"
        );
      }
  }

  return file;
};
