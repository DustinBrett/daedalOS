import { basename } from "path";
import Panzoom from "@panzoom/panzoom";
import {
  type PanzoomEventDetail,
  type PanzoomObject,
} from "@panzoom/panzoom/dist/src/types";
import { useCallback, useEffect, useState } from "react";
import useResizeObserver from "hooks/useResizeObserver";
import { useProcesses } from "contexts/process";
import useTitle from "components/system/Window/useTitle";

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
  imgElement: HTMLImageElement | null,
  containerElement: HTMLElement | null
): PanZoom => {
  const [panZoom, setPanZoom] = useState<ReturnType<typeof Panzoom>>();
  const { getScale, reset, zoomIn, zoomOut, zoomToPoint, zoomWithWheel } =
    panZoom || {};
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { closing, componentWindow, url = "" } = process || {};
  const { prependFileToTitle } = useTitle(id);
  const zoomUpdate = useCallback<EventListener>(
    (panZoomEvent) => {
      const { detail: { scale = 0, x = 0, y = 0 } = {} } =
        (panZoomEvent as PanZoomEvent) || {};

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
    },
    [closing, panZoom, prependFileToTitle, url]
  );
  const zoomWheel = useCallback(
    (event: WheelEvent) => zoomWithWheel?.(event, { step: 0.3 }),
    [zoomWithWheel]
  );

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
      setPanZoom(Panzoom(imgElement, panZoomConfig));
    }

    return () => panZoom?.destroy();
  }, [imgElement, panZoom]);

  return { reset, scale: getScale?.(), zoomIn, zoomOut, zoomToPoint };
};

export default usePanZoom;
