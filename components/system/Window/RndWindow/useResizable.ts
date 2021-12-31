import useDefaultSize from "components/system/Window/RndWindow/useDefaultSize";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useEffect, useState } from "react";
import type { Props } from "react-rnd";
import { maxSize } from "utils/functions";

export type Size = NonNullable<Props["size"]>;

type Resizable = [Size, React.Dispatch<React.SetStateAction<Size>>];

const useResizable = (id: string, autoSizing = false): Resizable => {
  const defaultSize = useDefaultSize(id);
  const { windowStates: { [id]: { size = defaultSize } = {} } = {} } =
    useSession();
  const {
    processes: { [id]: { lockAspectRatio = false } = {} },
  } = useProcesses();
  const [{ height, width }, setSize] = useState<Size>(
    maxSize(size, lockAspectRatio)
  );

  useEffect(() => {
    if (autoSizing) setSize(maxSize(size, lockAspectRatio));
  }, [autoSizing, lockAspectRatio, size]);

  return [{ height, width }, setSize];
};

export default useResizable;
