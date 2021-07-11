import type { Size } from "components/system/Window/RndWindow/useResizable";
import type { Processes } from "contexts/process/types";
import type { ProcessContextState } from "contexts/process/useProcessContextState";
import type { Position } from "react-rnd";
import {
  PROCESS_DELIMITER,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { pxToNum } from "utils/functions";

type processCloser = ProcessContextState["close"];

export const cascadePosition = (
  id: string,
  processes: Processes,
  stackOrder: string[],
  offset = 0
): Position | undefined => {
  const [pid] = id.split(PROCESS_DELIMITER);
  const processPid = `${pid}${PROCESS_DELIMITER}`;
  const parentPositionProcess =
    stackOrder.find((stackPid) => stackPid.startsWith(processPid)) || "";
  const { componentWindow } = processes?.[parentPositionProcess] || {};
  const { x = 0, y = 0 } = componentWindow?.getBoundingClientRect() || {};

  return x || y
    ? {
        x: x + offset,
        y: y + offset,
      }
    : undefined;
};

export const centerPosition = (
  { height, width }: Size,
  taskbarHeight: string
): Position => {
  const { innerHeight: vh, innerWidth: vw } = window;

  return {
    x: Math.floor(vw / 2 - pxToNum(width) / 2),
    y: Math.floor((vh - pxToNum(taskbarHeight)) / 2 - pxToNum(height) / 2),
  };
};

export const closeWithTransition = (close: processCloser, id: string): void => {
  close(id, true);
  setTimeout(() => close(id), TRANSITIONS_IN_MILLISECONDS.WINDOW);
};
