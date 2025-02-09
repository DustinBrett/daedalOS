import { useMemo } from "react";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";

const useNextFocusable = (id: string): string => {
  const { stackOrder = [] } = useSession();
  const { processes } = useProcesses();
  const nextFocusableId = useMemo(
    () =>
      stackOrder.find(
        (stackId) => stackId !== id && !processes?.[stackId]?.minimized
      ),
    [id, processes, stackOrder]
  );

  return nextFocusableId || "";
};

export default useNextFocusable;
