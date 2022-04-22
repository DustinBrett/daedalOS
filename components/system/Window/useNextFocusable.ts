import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";

const useNextFocusable = (id: string): string => {
  const { stackOrder = [] } = useSession();
  const { processes } = useProcesses();

  const nextFocusableId = stackOrder.find(
    (stackId) => stackId !== id && !processes?.[stackId]?.minimized
  );

  return nextFocusableId || "";
};

export default useNextFocusable;
