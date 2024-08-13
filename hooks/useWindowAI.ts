import { useCallback, useEffect, useState } from "react";

let HAS_WINDOW_AI = false;

const supportsAI = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  if (!("ai" in window)) return false;

  try {
    if (!("canCreateTextSession" in window.ai)) return false;

    const hasWindowAi = (await window.ai.canCreateTextSession()) !== "no";

    if (hasWindowAi) HAS_WINDOW_AI = true;

    return hasWindowAi;
  } catch {
    return false;
  }
};

export const useWindowAI = (): boolean => {
  const [hasAI, setHasAI] = useState<boolean>(HAS_WINDOW_AI);
  const checkAI = useCallback(async () => {
    const hasWindowAi = await supportsAI();

    if (hasWindowAi) setHasAI(true);
  }, []);

  useEffect(() => {
    if (!hasAI) requestAnimationFrame(checkAI);
  }, [checkAI, hasAI]);

  return hasAI;
};
