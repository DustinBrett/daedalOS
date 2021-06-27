import StyledPeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekWindow";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcesses } from "contexts/process";
import { toPng } from "html-to-image";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
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
    processes: {
      [id]: { componentWindow = undefined, minimized = false, title = "" } = {},
    },
  } = useProcesses();
  const mouseTimer = useRef<NodeJS.Timer | null>(null);
  const previewTimer = useRef<NodeJS.Timer | null>(null);
  const [showPeek, setShowPeek] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const { onClose } = useWindowActions(id);
  const PeekWindow = (): JSX.Element => (
    <StyledPeekWindow>
      <img alt={title} src={previewSrc} />
      <Button onClick={onClose} title="Close">
        <CloseIcon />
      </Button>
    </StyledPeekWindow>
  );
  const onMouseEnter = () => {
    if (componentWindow) {
      const renderFrame = () =>
        toPng(componentWindow).then((dataUrl) => {
          const previewImage = new Image();

          previewImage.src = dataUrl;
          previewImage.onload = () => setPreviewSrc(dataUrl);
        });

      mouseTimer.current = setTimeout(() => {
        renderFrame();
        setShowPeek(true);
        previewTimer.current = setInterval(renderFrame, MILLISECONDS_IN_SECOND);
      }, MILLISECONDS_IN_SECOND / 2);
    }
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
    PeekComponent: showPeek && previewSrc ? PeekWindow : undefined,
    peekEvents: minimized
      ? {}
      : {
          onMouseEnter,
          onMouseLeave,
        },
  };
};

export default useWindowPeek;
