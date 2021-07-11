import { useProcesses } from "contexts/process";
import type { MotionProps, Variant } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import {
  MILLISECONDS_IN_SECOND,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { pxToNum } from "utils/functions";

const active = {
  height: "inherit",
  opacity: 1,
  scale: 1,
  width: "inherit",
};

const initial = {
  height: "inherit",
  opacity: 0,
  scale: 0.95,
  width: "inherit",
};

const baseMaximize = {
  opacity: 1,
  scale: 1,
  width: "100vw",
};

const baseMinimize = {
  opacity: 0,
  scale: 0.7,
};

const useWindowTransitions = (id: string): MotionProps => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { componentWindow, maximized, minimized, taskbarEntry } = process || {};
  const { sizes: { taskbar } = {} } = useTheme();
  const [maximize, setMaximize] = useState<Variant>({});
  const [minimize, setMinimize] = useState<Variant>({});

  useEffect(() => {
    const { x: windowX = 0, y: windowY = 0 } =
      componentWindow?.getBoundingClientRect() || {};

    setMaximize({
      ...baseMaximize,
      height: `${window.innerHeight - pxToNum(taskbar?.height)}px`,
      x: -windowX,
      y: -windowY,
    });
  }, [componentWindow, maximized, taskbar?.height]);

  useEffect(() => {
    const {
      height: taskbarHeight = 0,
      width: taskbarWidth = 0,
      x: taskbarX = 0,
      y: taskbarY = 0,
    } = taskbarEntry?.getBoundingClientRect() || {};
    const {
      height: windowHeight = 0,
      width: windowWidth = 0,
      x: windowX = 0,
      y: windowY = 0,
    } = componentWindow?.getBoundingClientRect() || {};

    setMinimize({
      ...baseMinimize,
      x: taskbarX - windowX - windowWidth / 2 + taskbarWidth / 2,
      y: taskbarY - windowY - windowHeight / 2 + taskbarHeight / 2,
    });
  }, [componentWindow, minimized, taskbarEntry]);

  return {
    animate: (minimized && "minimize") || (maximized && "maximize") || "active",
    exit: "initial",
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_MILLISECONDS.WINDOW / MILLISECONDS_IN_SECOND,
    },
    variants: { active, initial, maximize, minimize },
  };
};

export default useWindowTransitions;
