type LibHeif = {
  libheif: () => {
    HeifDecoder: new () => {
      decode: (file: Buffer) => {
        display: (
          imageData: ImageData,
          callback: (data: ImageData) => void
        ) => void;
        get_height: () => number;
        get_width: () => number;
      }[];
    };
  };
};

globalThis.addEventListener(
  "message",
  ({ data: image }: { data: Buffer }) => {
    globalThis.importScripts("/System/libheif/libheif-bundle.js");

    const { libheif } = globalThis as unknown as typeof globalThis & LibHeif;
    const { HeifDecoder } = libheif();

    const [decodedImage] = new HeifDecoder().decode(image);
    const width = decodedImage.get_width();
    const height = decodedImage.get_height();

    decodedImage.display(
      {
        data: new Uint8ClampedArray(width * height * 4),
        height,
        width,
      } as ImageData,
      ({ data }) => globalThis.postMessage(new ImageData(data, width, height))
    );
  },
  { passive: true }
);
