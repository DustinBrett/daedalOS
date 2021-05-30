import { useProcesses } from 'contexts/process';
import type { MotionProps, Variant } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import {
  MILLISECONDS_IN_SECOND,
  WINDOW_TRANSITION_DURATION_IN_MILLISECONDS
} from 'utils/constants';
import { pxToNum } from 'utils/functions';

const active = {
  height: 'inherit',
  opacity: 1,
  scale: 1,
  width: 'inherit'
};

const initial = {
  opacity: 0,
  scale: 0.95
};

const baseMaximize = {
  opacity: 1,
  scale: 1,
  width: '100vw'
};

const baseMinimize = {
  opacity: 0,
  scale: 0.7
};

const useWindowTransitions = (
  id: string,
  windowRef: React.MutableRefObject<HTMLElement | null>
): MotionProps => {
  const {
    processes: {
      [id]: {
        maximized = false,
        minimized = false,
        taskbarEntry = undefined
      } = {}
    }
  } = useProcesses();
  const { sizes: { taskbar } = {} } = useTheme();
  const [maximize, setMaximize] = useState<Variant>({});
  const [minimize, setMinimize] = useState<Variant>({});

  useEffect(() => {
    const { x: windowX = 0, y: windowY = 0 } =
      windowRef?.current?.getBoundingClientRect() || {};

    setMaximize({
      ...baseMaximize,
      height: `${window.innerHeight - pxToNum(taskbar?.height)}px`,
      x: -windowX,
      y: -windowY
    });
  }, [maximized, taskbar?.height, windowRef]);

  useEffect(() => {
    const {
      height: taskbarHeight = 0,
      width: taskbarWidth = 0,
      x: taskbarX = 0,
      y: taskbarY = 0
    } = taskbarEntry?.getBoundingClientRect() || {};
    const {
      height: windowHeight = 0,
      width: windowWidth = 0,
      x: windowX = 0,
      y: windowY = 0
    } = windowRef?.current?.getBoundingClientRect() || {};

    setMinimize({
      ...baseMinimize,
      x: taskbarX - windowX - windowWidth / 2 + taskbarWidth / 2,
      y: taskbarY - windowY - windowHeight / 2 + taskbarHeight / 2
    });
  }, [minimized, taskbarEntry, windowRef]);

  return {
    animate: (minimized && 'minimize') || (maximized && 'maximize') || 'active',
    exit: 'initial',
    initial: 'initial',
    transition: {
      duration:
        WINDOW_TRANSITION_DURATION_IN_MILLISECONDS / MILLISECONDS_IN_SECOND
    },
    variants: { active, initial, maximize, minimize }
  };
};

export default useWindowTransitions;
