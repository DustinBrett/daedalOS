import { useCallback, useEffect, useState } from "react";

let HAS_WINDOW_AI = false;

const supportsAI = async (): Promise<boolean> => {
  if (
    typeof window === "undefined" ||
    !("ai" in window) ||
    !("languageModel" in window.ai) ||
    typeof window.ai.languageModel !== "object" ||
    !("capabilities" in window.ai.languageModel) ||
    typeof window.ai.languageModel.capabilities !== "function"
  ) {
    return false;
  }

  try {
    HAS_WINDOW_AI =
      (await window.ai.languageModel.capabilities()).available === "readily";

    return HAS_WINDOW_AI;
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
