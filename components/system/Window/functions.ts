import { type Position } from "react-rnd";
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
} from "components/system/Window/RndWindow/rndDefaults";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { type Processes } from "contexts/process/types";
import { type WindowState } from "contexts/session/types";
import { PROCESS_DELIMITER, TASKBAR_HEIGHT } from "utils/constants";
import { pxToNum, viewHeight, viewWidth } from "utils/functions";

export const cascadePosition = (
  id: string,
  processes: Processes,
  stackOrder: string[] = [],
  offset = 0
): Position | undefined => {
  const [pid] = id.split(PROCESS_DELIMITER);
  const processPid = `${pid}${PROCESS_DELIMITER}`;
  const parentPositionProcess =
    stackOrder.find((stackPid) => stackPid.startsWith(processPid)) || "";
  const { componentWindow } = processes?.[parentPositionProcess] || {};
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
  } = componentWindow?.getBoundingClientRect() || {};
  const isOffscreen =
    x + offset + width > viewWidth() || y + offset + height > viewHeight();

  return !isOffscreen && (x || y)
    ? {
        x: x + offset,
        y: y + offset,
      }
    : undefined;
};

export const centerPosition = ({ height, width }: Size): Position => {
  const [vh, vw] = [viewHeight(), viewWidth()];

  return {
    x: Math.floor(vw / 2 - pxToNum(width) / 2),
    y: Math.floor((vh - TASKBAR_HEIGHT) / 2 - pxToNum(height) / 2),
  };
};

export const WINDOW_OFFSCREEN_BUFFER_PX = {
  BOTTOM: 15,
  LEFT: 150,
  RIGHT: 50,
  TOP: 15,
};

export const isWindowOutsideBounds = (
  windowState: WindowState,
  bounds: Position,
  checkOffscreen = false
): boolean => {
  const { position, size } = windowState || {};
  const { x = 0, y = 0 } = position || {};
  const { height = 0, width = 0 } = size || {};

  if (checkOffscreen) {
    return (
      x + WINDOW_OFFSCREEN_BUFFER_PX.RIGHT > bounds.x ||
      x + pxToNum(width) - WINDOW_OFFSCREEN_BUFFER_PX.LEFT < 0 ||
      y + WINDOW_OFFSCREEN_BUFFER_PX.BOTTOM > bounds.y ||
      y + WINDOW_OFFSCREEN_BUFFER_PX.TOP < 0
    );
  }

  return (
    x < 0 ||
    y < 0 ||
    x + pxToNum(width) > bounds.x ||
    y + pxToNum(height) > bounds.y
  );
};

export const minMaxSize = (size: Size, lockAspectRatio: boolean): Size => {
  const desiredHeight = Number(size.height);
  const desiredWidth = Number(size.width);
  const [vh, vw] = [viewHeight(), viewWidth()];
  const vhWithoutTaskbar = vh - TASKBAR_HEIGHT;
  const height = Math.max(
    MIN_WINDOW_HEIGHT,
    Math.min(desiredHeight, vhWithoutTaskbar)
  );
  const width = Math.max(MIN_WINDOW_WIDTH, Math.min(desiredWidth, vw));

  if (!lockAspectRatio) return { height, width };

  const isDesiredHeight = desiredHeight === height;
  const isDesiredWidth = desiredWidth === width;

  if (!isDesiredHeight && !isDesiredWidth) {
    if (desiredHeight > desiredWidth) {
      return {
        height,
        width: Math.round(width / (vhWithoutTaskbar / height)),
      };
    }

    return {
      height: Math.round(height / (vw / width)),
      width,
    };
  }

  if (!isDesiredHeight) {
    return {
      height,
      width: Math.round(width / (desiredHeight / height)),
    };
  }

  if (!isDesiredWidth) {
    return {
      height: Math.round(height / (desiredWidth / width)),
      width,
    };
  }

  return { height, width };
};
