import { useIsPresent } from "motion/react";
import { useEffect, useState } from "react";
import {
  captureElement,
  drawLiveElement,
  drawLivePlacement,
  drawPeek,
  getFrameDocuments,
  getLivePlacements,
  isLiveElement,
  type LivePlacement,
} from "components/system/Taskbar/TaskbarEntry/Peek/functions";
import { useProcess } from "contexts/process";
import { MAX_ICON_SIZE, TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import {
  getExtension,
  imageSrc as getImageSrc,
  isCanvasDrawn,
} from "utils/functions";

const PEEK_REFRESH_MS = 250;

const useWindowPeek = (
  id: string,
  canvas: HTMLCanvasElement | null | undefined,
  delay: number
): boolean => {
  const { componentWindow, hidePeek, icon, peekElement, peekImage } =
    useProcess(id);
  const isPresent = useIsPresent();
  // eslint-disable-next-line react/hook-use-state
  const [showAt] = useState(() => performance.now() + delay);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ctx = canvas?.getContext("2d");
    // Cross-origin frames can't be captured, so the window is used instead
    const element =
      peekElement?.nodeName === "IFRAME" &&
      getFrameDocuments(peekElement).length === 0
        ? componentWindow
        : peekElement || componentWindow;
    let active = true;
    let animationFrame = 0;
    let showTimer = 0;
    let refreshTimer = 0;
    let openEnd = 0;
    let unsubscribe = (): void => undefined;
    const show = (): void => {
      if (showTimer) return;

      openEnd =
        Math.max(showAt, performance.now()) +
        TRANSITIONS_IN_MILLISECONDS.WINDOW;
      showTimer = window.setTimeout(
        () => setReady(true),
        showAt - performance.now()
      );
    };

    if (ctx && isPresent) {
      if (hidePeek || peekImage) {
        const image = new Image();

        image.src =
          peekImage || getImageSrc(icon, MAX_ICON_SIZE, 1, getExtension(icon));
        image
          .decode()
          .then(() => {
            if (
              active &&
              drawPeek(ctx, image, image.naturalWidth, image.naturalHeight)
            ) {
              show();
            }
          })
          .catch(() => {
            // Ignore failure to load image
          });
      } else if (element && isLiveElement(element)) {
        const drawFrame = (): void => {
          if (drawLiveElement(ctx, element)) show();

          animationFrame = window.requestAnimationFrame(drawFrame);
        };

        drawFrame();
      } else if (element) {
        let snapshot: HTMLCanvasElement | undefined;
        let placements: LivePlacement[] = [];
        let capturing = false;
        let changed = false;
        let lastCapture = 0;
        const drawFrame = (): void => {
          if (!snapshot) return;

          drawPeek(ctx, snapshot, snapshot.width, snapshot.height);
          placements.forEach((placement) => drawLivePlacement(ctx, placement));
          animationFrame =
            placements.length > 0 ? window.requestAnimationFrame(drawFrame) : 0;
        };
        // Captures wait for the open transition and are spaced out
        const refresh = (): void => {
          changed = true;

          if (capturing || refreshTimer) return;

          refreshTimer = window.setTimeout(
            async () => {
              refreshTimer = 0;
              capturing = true;
              changed = false;

              const nextSnapshot = await captureElement(element);

              capturing = false;
              lastCapture = performance.now();

              if (!active) return;

              const nextPlacements = nextSnapshot
                ? getLivePlacements(element, nextSnapshot.width)
                : [];
              const isDrawn = isCanvasDrawn(nextSnapshot);

              if (nextSnapshot && (isDrawn || nextPlacements.length > 0)) {
                snapshot = nextSnapshot;
                placements = nextPlacements;
                if (!animationFrame) drawFrame();
                show();
              }

              if (!snapshot || changed) refresh();
            },
            Math.max(openEnd, lastCapture + PEEK_REFRESH_MS) - performance.now()
          );
        };
        const observer = new MutationObserver((records) => {
          if (records.some(({ target }) => !isLiveElement(target))) refresh();
        });
        const targets = [element, ...getFrameDocuments(element)];

        targets.forEach((target) => {
          observer.observe(target, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
          });
          target.addEventListener("scroll", refresh, {
            capture: true,
            passive: true,
          });
        });
        unsubscribe = () => {
          observer.disconnect();
          targets.forEach((target) =>
            target.removeEventListener("scroll", refresh, { capture: true })
          );
        };
        refresh();
      }
    }

    return () => {
      active = false;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(showTimer);
      window.clearTimeout(refreshTimer);
      unsubscribe();
    };
  }, [
    canvas,
    componentWindow,
    hidePeek,
    icon,
    isPresent,
    peekElement,
    peekImage,
    showAt,
  ]);

  return ready && isPresent;
};

export default useWindowPeek;
