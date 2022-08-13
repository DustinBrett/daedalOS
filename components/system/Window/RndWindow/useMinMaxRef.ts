import { useProcesses } from "contexts/process";
import { useEffect, useRef } from "react";

const useMinMaxRef = (id: string): React.MutableRefObject<boolean> => {
  const { processes } = useProcesses();
  const { maximized = false, minimized = false } = processes[id] || {};
  const blockAutoPositionRef = useRef(false);

  useEffect(() => {
    blockAutoPositionRef.current = Boolean(maximized || minimized);
  }, [maximized, minimized]);

  return blockAutoPositionRef;
};

export default useMinMaxRef;
