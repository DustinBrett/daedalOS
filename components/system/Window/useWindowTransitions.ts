import { useProcesses } from 'contexts/process';
import type { MotionProps, Variant } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import {
  MILLISECONDS_IN_SECOND,
  WINDOW_TRANSITION_DURATION_IN_MILLISECONDS
} from 'utils/constants';
import { pxToNum } from 'utils/functions';

const staticBaseVariants = {
  active: {
    opacity: 1,
    scale: 1
  },
  initial: {
    opacity: 0,
    scale: 0.95
  }
};

const staticMaximizeVariant = {
  opacity: 1,
  scale: 1,
  width: '100vw'
};

const staticMinimizeVariant = {
  opacity: 0,
  scale: 0.75
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
      ...staticMaximizeVariant,
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
    const { height: windowHeight = 0, x: windowX = 0, y: windowY = 0 } =
      windowRef?.current?.getBoundingClientRect() || {};

    setMinimize({
      ...staticMinimizeVariant,
      x: taskbarX - windowX - taskbarWidth / 2,
      y: taskbarY - windowY - windowHeight / 2 - taskbarHeight / 2
    });
  }, [minimized, taskbarEntry, windowRef]);

  return {
    animate: (maximized && 'maximize') || (minimized && 'minimize') || 'active',
    exit: 'initial',
    initial: 'initial',
    transition: {
      duration:
        WINDOW_TRANSITION_DURATION_IN_MILLISECONDS / MILLISECONDS_IN_SECOND
    },
    variants: {
      ...staticBaseVariants,
      maximize,
      minimize
    }
  };
};

export default useWindowTransitions;
