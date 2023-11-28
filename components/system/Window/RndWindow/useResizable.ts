import { type Props } from "react-rnd";
import { useLayoutEffect, useState } from "react";
import useDefaultSize from "components/system/Window/RndWindow/useDefaultSize";
import useMinMaxRef from "components/system/Window/RndWindow/useMinMaxRef";
import { minMaxSize } from "components/system/Window/functions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";

export type Size = NonNullable<Props["size"]>;

type Resizable = [Size, React.Dispatch<React.SetStateAction<Size>>];

const useResizable = (id: string, autoSizing = false): Resizable => {
  const defaultSize = useDefaultSize(id);
  const {
    windowStates: { [id]: { size: stateSize = defaultSize } = {} } = {},
  } = useSession();
  const {
    processes: { [id]: { lockAspectRatio = false } = {} },
  } = useProcesses();
  const [size, setSize] = useState<Size>(() =>
    minMaxSize(stateSize, lockAspectRatio)
  );
  const blockAutoSizeRef = useMinMaxRef(id);

  useLayoutEffect(() => {
    if (autoSizing && !blockAutoSizeRef.current) {
      setSize(minMaxSize(stateSize, lockAspectRatio));
    }
  }, [autoSizing, blockAutoSizeRef, lockAspectRatio, stateSize]);

  return [size, setSize];
};

export default useResizable;
