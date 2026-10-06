import { basename } from "path";
import Panzoom from "@panzoom/panzoom";
import {
  type PanzoomEventDetail,
  type PanzoomObject,
} from "@panzoom/panzoom/dist/src/types";
import { useEffect, useState } from "react";
import useTitle from "components/system/Window/useTitle";
import { useProcess } from "contexts/process";
import useResizeObserver from "hooks/useResizeObserver";

export const panZoomConfig = {
  cursor: "default",
  maxScale: 7,
  minScale: 1,
  panOnlyWhenZoomed: true,
  step: 0.1,
};

type PanZoomEvent = Event & { detail: PanzoomEventDetail };

type PanZoom = Partial<
  Pick<PanzoomObject, "reset" | "zoomIn" | "zoomOut" | "zoomToPoint">
> & { scale?: number };

const usePanZoom = (
  id: string,
  imgElement?: HTMLImageElement | null,
  containerElement?: HTMLElement | null
): PanZoom => {
  const [panZoom, setPanZoom] = useState<ReturnType<typeof Panzoom>>();
  const { reset, zoomIn, zoomOut, zoomToPoint, zoomWithWheel } = panZoom || {};
  const [currentScale, setCurrentScale] = useState<number>();
  const { closing, componentWindow, url = "" } = useProcess(id);
  const { prependFileToTitle } = useTitle(id);
  const zoomUpdate: EventListener = (panZoomEvent) => {
    const { detail: { scale = 0, x = 0, y = 0 } = {} } =
      (panZoomEvent as PanZoomEvent) || {};

    setCurrentScale(scale);

    if (url && scale) {
      const { minScale, step } = panZoomConfig;
      const isMinScale = scale < minScale + step;

      if (isMinScale && (x || y)) {
        window.setTimeout(() => panZoom?.reset(), 50);
      }

      if (!closing) {
        prependFileToTitle(
          isMinScale
            ? basename(url)
            : `${basename(url)} (${Math.floor(scale * 100)}%)`
        );
      }
    }
  };
  const zoomWheel = (event: WheelEvent): void => {
    zoomWithWheel?.(event, { step: 0.3 });
  };

  useResizeObserver(componentWindow, reset);

  useEffect(() => {
    if (imgElement && containerElement) {
      imgElement.addEventListener("panzoomchange", zoomUpdate);
      containerElement.addEventListener("wheel", zoomWheel);
    }

    return () => {
      imgElement?.removeEventListener("panzoomchange", zoomUpdate);
      containerElement?.removeEventListener("wheel", zoomWheel);
    };
  }, [containerElement, imgElement, zoomUpdate, zoomWheel]);

  useEffect(() => {
    if (imgElement && !panZoom) {
      // eslint-disable-next-line react/set-state-in-effect -- Creates the Panzoom instance once the image mounts
      setPanZoom(Panzoom(imgElement, panZoomConfig));
    }

    return () => panZoom?.destroy();
  }, [imgElement, panZoom]);

  return { reset, scale: currentScale, zoomIn, zoomOut, zoomToPoint };
};

export default usePanZoom;
