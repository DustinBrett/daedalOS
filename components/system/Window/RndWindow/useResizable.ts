import useDefaultSize from "components/system/Window/RndWindow/useDefaultSize";
import { useSession } from "contexts/session";
import { useEffect, useState } from "react";
import type { Props } from "react-rnd";

export type Size = NonNullable<Props["size"]>;

type Resizable = [Size, React.Dispatch<React.SetStateAction<Size>>];

const useResizable = (id: string, autoSizing = false): Resizable => {
  const defaultSize = useDefaultSize(id);
  const { windowStates: { [id]: { size = defaultSize } = {} } = {} } =
    useSession();
  const [{ height, width }, setSize] = useState<Size>(size);

  useEffect(() => {
    if (autoSizing) setSize(size);
  }, [autoSizing, size]);

  return [{ height, width }, setSize];
};

export default useResizable;
