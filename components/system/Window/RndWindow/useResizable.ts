import useDefaultSize from "components/system/Window/RndWindow/useDefaultSize";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useLayoutEffect, useState } from "react";
import type { Props } from "react-rnd";
import { maxSize } from "utils/functions";

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
    maxSize(stateSize, lockAspectRatio)
  );

  useLayoutEffect(() => {
    if (autoSizing) setSize(maxSize(stateSize, lockAspectRatio));
  }, [autoSizing, lockAspectRatio, stateSize]);

  return [size, setSize];
};

export default useResizable;
