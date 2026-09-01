import { useEffect, useRef } from "react";
import { useProcess } from "contexts/process";

const useMinMaxRef = (id: string): React.RefObject<boolean> => {
  const { maximized = false, minimized = false } = useProcess(id);
  const blockAutoPositionRef = useRef(false);

  useEffect(() => {
    blockAutoPositionRef.current = maximized || minimized;
  }, [maximized, minimized]);

  return blockAutoPositionRef;
};

export default useMinMaxRef;
