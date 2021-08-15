import { useProcesses } from "contexts/process";
import { useEffect, useRef, useState } from "react";
import {
  MILLISECONDS_IN_SECOND,
  ONE_TIME_PASSIVE_EVENT,
} from "utils/constants";

const renderFrame = (
  previewElement: HTMLElement,
  previewTimer: React.MutableRefObject<NodeJS.Timer | undefined>,
  callback: (url: string) => void
): void => {
  import("html-to-image").then(({ toCanvas }) =>
    toCanvas(previewElement).then((canvas) => {
      const { height = 0, width = 0 } = canvas;

      if (height && width) {
        const { data: pixelData } =
          canvas
            .getContext("2d", { alpha: false, desynchronized: true })
            ?.getImageData(0, 0, width, height) || {};

        if (pixelData?.some(Boolean)) {
          const dataUrl = canvas.toDataURL();
          const previewImage = new Image();

          previewImage.src = dataUrl;
          previewImage.addEventListener(
            "load",
            () => {
              if (typeof previewTimer.current !== "undefined") {
                callback(dataUrl);
              }
            },
            ONE_TIME_PASSIVE_EVENT
          );
        } else {
          renderFrame(previewElement, previewTimer, callback);
        }
      }
    })
  );
};

const useWindowPeek = (id: string): string => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { peekElement, componentWindow } = process || {};
  const previewTimer = useRef<NodeJS.Timer>();
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    const previewElement = peekElement || componentWindow;

    if (!previewTimer.current && previewElement) {
      previewTimer.current = setInterval(
        () => renderFrame(previewElement, previewTimer, setImageSrc),
        MILLISECONDS_IN_SECOND / 2
      );
    }

    return () => {
      if (previewTimer.current) {
        clearTimeout(previewTimer.current);
        previewTimer.current = undefined;
      }
    };
  }, [componentWindow, peekElement]);

  return imageSrc;
};

export default useWindowPeek;
