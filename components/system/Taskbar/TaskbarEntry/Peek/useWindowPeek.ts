import { useProcesses } from "contexts/process";
import { useEffect, useRef, useState } from "react";
import {
  BASE_2D_CONTEXT_OPTIONS,
  MILLISECONDS_IN_SECOND,
  ONE_TIME_PASSIVE_EVENT,
} from "utils/constants";

const renderFrame = async (
  previewElement: HTMLElement,
  animate: React.MutableRefObject<boolean>,
  callback: (url: string) => void
): Promise<void> => {
  const htmlToImage = await import("html-to-image");
  const canvas = await htmlToImage.toCanvas(previewElement);
  const { height = 0, width = 0 } = canvas;
  const nextFrame = (): number =>
    window.requestAnimationFrame(() =>
      renderFrame(previewElement, animate, callback)
    );

  if (animate.current && height && width) {
    const { data: pixelData } =
      canvas
        .getContext("2d", BASE_2D_CONTEXT_OPTIONS)
        ?.getImageData(0, 0, width, height) || {};

    if (pixelData?.some(Boolean)) {
      const dataUrl = canvas.toDataURL();
      const previewImage = new Image();

      previewImage.src = dataUrl;
      previewImage.addEventListener(
        "load",
        () => {
          if (animate.current) {
            callback(dataUrl);
            nextFrame();
          }
        },
        ONE_TIME_PASSIVE_EVENT
      );
    } else {
      nextFrame();
    }
  }
};

const useWindowPeek = (id: string): string => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { peekElement, componentWindow } = process || {};
  const previewTimer = useRef<NodeJS.Timer>();
  const [imageSrc, setImageSrc] = useState("");
  const animate = useRef(true);

  useEffect(() => {
    const previewElement = peekElement || componentWindow;

    if (!previewTimer.current && previewElement) {
      previewTimer.current = setTimeout(
        () =>
          window.requestAnimationFrame(() =>
            renderFrame(previewElement, animate, setImageSrc)
          ),
        MILLISECONDS_IN_SECOND / 2
      );
    }

    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
      animate.current = false;
    };
  }, [componentWindow, peekElement]);

  return imageSrc;
};

export default useWindowPeek;
