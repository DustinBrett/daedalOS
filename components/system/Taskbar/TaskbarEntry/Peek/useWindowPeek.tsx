import PeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/PeekWindow";
import { useProcesses } from "contexts/process";
import { useCallback, useEffect, useRef, useState } from "react";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

type WindowPeek = {
  PeekComponent?: React.ComponentType;
  peekEvents: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  };
};

const useWindowPeek = (id: string): WindowPeek => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { peekElement, componentWindow, minimized } = process || {};
  const mouseTimer = useRef<NodeJS.Timer>();
  const previewTimer = useRef<NodeJS.Timer>();
  const [showPeek, setShowPeek] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  const onMouseEnter = () => {
    const renderFrame = () => {
      const previewElement = peekElement || componentWindow;

      if (previewElement) {
        import("html-to-image").then(({ toPng }) =>
          toPng(previewElement).then((dataUrl) => {
            const previewImage = new Image();

            previewImage.src = dataUrl;
            previewImage.onload = () => setPreviewSrc(dataUrl);
          })
        );
      }
    };

    mouseTimer.current = setTimeout(() => {
      renderFrame();
      setShowPeek(true);
      previewTimer.current = setInterval(renderFrame, MILLISECONDS_IN_SECOND);
    }, MILLISECONDS_IN_SECOND / 2);
  };
  const onMouseLeave = useCallback(() => {
    if (mouseTimer?.current) clearTimeout(mouseTimer.current);
    if (previewTimer?.current) clearInterval(previewTimer.current);

    setShowPeek(false);
    setPreviewSrc("");
  }, []);

  useEffect(() => {
    if (minimized) {
      setShowPeek(false);
      setPreviewSrc("");
    }
  }, [minimized]);

  useEffect(() => onMouseLeave, [onMouseLeave]);

  return {
    PeekComponent:
      showPeek && previewSrc
        ? () => <PeekWindow id={id} image={previewSrc} />
        : undefined,
    peekEvents: minimized
      ? {}
      : {
          onMouseEnter,
          onMouseLeave,
        },
  };
};

export default useWindowPeek;
