import { useState } from "react";

type Fullscreen = {
  fullscreen: boolean;
  toggleFullscreen: () => void;
};

const useFullscreen = (
  elementRef: React.MutableRefObject<HTMLElement | null>
): Fullscreen => {
  const [fullscreen, setFullscreen] = useState(false);
  const monitorFullscreenEvent = (): void => {
    const exitFullscreenEvent = (): void => {
      if (!document.fullscreenElement) {
        document.removeEventListener("fullscreenchange", exitFullscreenEvent);
        setFullscreen(false);
      }
    };

    if (document.fullscreenElement) {
      setFullscreen(true);
      document.addEventListener("fullscreenchange", exitFullscreenEvent);
    }
  };
  const toggleFullscreen = (): void => {
    if (fullscreen) {
      document.exitFullscreen();
    } else {
      elementRef.current
        ?.requestFullscreen({ navigationUI: "show" })
        .then(monitorFullscreenEvent);
    }
  };

  return {
    fullscreen,
    toggleFullscreen,
  };
};

export default useFullscreen;
