import { type MotionProps, type Variant } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { type Position } from "react-rnd";
import { useProcess } from "contexts/process";
import { TASKBAR_HEIGHT, TRANSITIONS_IN_SECONDS } from "utils/constants";
import { viewHeight, viewWidth } from "utils/functions";

const active = {
  height: "inherit",
  opacity: 1,
  scale: 1,
  width: "inherit",
};

const exit = {
  opacity: 0,
  scale: 0.95,
};

const initial = {
  ...exit,
  height: "inherit",
  width: "inherit",
};

const fullScaleInitial = {
  ...initial,
  scale: 1,
};

const baseMaximize = {
  opacity: 1,
  scale: 1,
};

const baseMinimize = {
  opacity: 0,
  scale: 0.7,
};

const instant = { transition: { duration: 0 } };

const getMaxDimensions = (): Variant => ({
  height: viewHeight() - TASKBAR_HEIGHT,
  width: viewWidth(),
});

const useWindowTransitions = (
  id: string,
  position?: Position,
  noInitialScaling = false
): MotionProps => {
  const {
    closing,
    componentWindow,
    maximized = false,
    minimized,
    taskbarEntry,
  } = useProcess(id);
  const { x: positionX = 0, y: positionY = 0 } = position || {};
  const [maximize, setMaximize] = useState<Variant>(
    Object.create(null) as Variant
  );
  const [minimize, setMinimize] = useState<Variant>(
    Object.create(null) as Variant
  );
  const wasMaximizedRef = useRef(false);

  useLayoutEffect(() => {
    if (closing) return;

    // A viewport resize can clamp the restore position while maximized, which
    // moves the Rnd wrapper instantly, so the offset back to the corner must too
    const isRepositioning = maximized && wasMaximizedRef.current;

    wasMaximizedRef.current = maximized;
    setMaximize({
      ...baseMaximize,
      ...getMaxDimensions(),
      ...(isRepositioning ? instant : {}),
      x: -positionX,
      y: -positionY,
    });
  }, [closing, maximized, positionX, positionY]);

  useLayoutEffect(() => {
    const taskbarEntries = taskbarEntry?.closest("ol");
    const rndWindow = componentWindow?.parentElement;
    // Measured from the Rnd wrapper as it ignores the window's own transform
    const alignWithTaskbarEntry = (transition?: typeof instant): void => {
      if (!taskbarEntry || !rndWindow || closing) return;

      const taskbar = taskbarEntry.getBoundingClientRect();
      const rnd = rndWindow.getBoundingClientRect();

      setMinimize({
        ...baseMinimize,
        ...transition,
        x: Math.round(taskbar.x + taskbar.width / 2 - rnd.x - rnd.width / 2),
        y: Math.round(taskbar.y + taskbar.height / 2 - rnd.y - rnd.height / 2),
      });
    };
    // Entry shifts when one before it closes, so the hidden window follows
    const taskbarObserver = new MutationObserver(() =>
      alignWithTaskbarEntry(instant)
    );

    alignWithTaskbarEntry();

    if (minimized && taskbarEntries) {
      taskbarObserver.observe(taskbarEntries, { childList: true });
    }

    return () => taskbarObserver.disconnect();
  }, [closing, componentWindow, minimized, taskbarEntry]);

  useEffect(() => {
    const monitorViewportResize = (): void => {
      if (maximized) {
        setMaximize((currentMaximize: Variant) => ({
          ...currentMaximize,
          ...getMaxDimensions(),
          ...instant,
        }));
      }
    };

    window.addEventListener("resize", monitorViewportResize, { passive: true });

    return () => window.removeEventListener("resize", monitorViewportResize);
  }, [maximized]);

  return {
    animate:
      (minimized ? "minimize" : "") ||
      (!closing && maximized ? "maximize" : "") ||
      "active",
    exit: "exit",
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_SECONDS.WINDOW,
    },
    variants: {
      active,
      exit,
      initial: noInitialScaling ? fullScaleInitial : initial,
      maximize,
      minimize,
    },
  };
};

export default useWindowTransitions;
