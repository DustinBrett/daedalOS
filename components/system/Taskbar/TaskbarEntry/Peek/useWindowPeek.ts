import { useProcesses } from "contexts/process";
import { useEffect, useRef, useState } from "react";
import {
  MILLISECONDS_IN_SECOND,
  ONE_TIME_PASSIVE_EVENT,
  PEEK_MAX_WIDTH,
} from "utils/constants";
import { getHtmlToImage, isCanvasDrawn } from "utils/functions";

const FPS = 15;

const renderFrame = async (
  previewElement: HTMLElement,
  animate: React.MutableRefObject<boolean>,
  callback: (url: string) => void
): Promise<void> => {
  if (!animate.current) return;
  const nextFrame = (): number =>
    window.requestAnimationFrame(() =>
      renderFrame(previewElement, animate, callback)
    );

  const htmlToImage = await getHtmlToImage();
  let dataCanvas: HTMLCanvasElement | undefined;

  try {
    dataCanvas = await htmlToImage?.toCanvas(previewElement, {
      ...(previewElement.clientWidth > PEEK_MAX_WIDTH && {
        canvasHeight: Math.round(
          (PEEK_MAX_WIDTH / previewElement.clientWidth) *
            previewElement.clientHeight
        ),
        canvasWidth: PEEK_MAX_WIDTH,
      }),
      filter: (element) => !(element instanceof HTMLSourceElement),
      skipAutoScale: true,
      style: {
        inset: "0",
      },
    });
  } catch {
    // Ignore failure to capture
  }

  if (dataCanvas && dataCanvas.width > 0 && dataCanvas.height > 0) {
    if (isCanvasDrawn(dataCanvas)) {
      const previewImage = new Image();
      const dataUrl = dataCanvas.toDataURL();

      previewImage.addEventListener(
        "load",
        () => {
          if (!animate.current) return;
          callback(dataUrl);
          window.setTimeout(nextFrame, MILLISECONDS_IN_SECOND / FPS);
        },
        ONE_TIME_PASSIVE_EVENT
      );
      previewImage.src = dataUrl;
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
  const previewTimer = useRef<number>();
  const [imageSrc, setImageSrc] = useState("");
  const animate = useRef(true);

  useEffect(() => {
    const previewElement = peekElement || componentWindow;

    if (!previewTimer.current && previewElement) {
      previewTimer.current = window.setTimeout(
        () =>
          window.requestAnimationFrame(() =>
            renderFrame(previewElement, animate, setImageSrc)
          ),
        document.querySelector(".peekWindow") ? 0 : MILLISECONDS_IN_SECOND / 2
      );
      animate.current = true;
    }

    return () => {
      if (previewTimer.current) {
        clearTimeout(previewTimer.current);
        previewTimer.current = undefined;
      }
      animate.current = false;
    };
  }, [componentWindow, peekElement]);

  return imageSrc;
};

export default useWindowPeek;
