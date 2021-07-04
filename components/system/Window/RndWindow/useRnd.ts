import rndDefaults from "components/system/Window/RndWindow/rndDefaults";
import useDraggable from "components/system/Window/RndWindow/useDraggable";
import useResizable from "components/system/Window/RndWindow/useResizable";
import { useProcesses } from "contexts/process";
import type { DraggableEventHandler } from "react-draggable";
import type { Props, RndResizeCallback } from "react-rnd";

const useRnd = (id: string, maximized = false): Props => {
  const {
    processes: { [id]: { autoSizing = false, lockAspectRatio = false } = {} },
  } = useProcesses();
  const [size, setSize] = useResizable(id, autoSizing);
  const [position, setPosition] = useDraggable(id, size);
  const onDragStop: DraggableEventHandler = (
    _event,
    { x: positionX, y: positionY }
  ) => setPosition({ x: positionX, y: positionY });
  const onResizeStop: RndResizeCallback = (
    _event,
    _direction,
    { style: { height: elementHeight, width: elementWidth } },
    _delta,
    { x: positionX, y: positionY }
  ) => {
    setSize({ height: elementHeight, width: elementWidth });
    setPosition({ x: positionX, y: positionY });
  };

  return {
    disableDragging: maximized,
    enableResizing: !maximized && (!autoSizing || lockAspectRatio),
    lockAspectRatio,
    onDragStop,
    onResizeStop,
    position,
    size,
    ...rndDefaults,
  };
};

export default useRnd;
