import { useCallback, useEffect, useState } from "react";

type AIAvailability = {
  availability?: () => Promise<"available" | "unavailable">;
  capabilities?: () => Promise<{ available: AICapabilityAvailability }>;
};

export const isAvailable = async (ai: AIAvailability): Promise<boolean> => {
  try {
    if (typeof ai.availability === "function") {
      return (await ai.availability()) === "available";
    }

    if (typeof ai.capabilities === "function") {
      return (await ai.capabilities()).available === "readily";
    }
  } catch {
    return false;
  }

  return false;
};

let HAS_WINDOW_AI = false;

const supportsAI = async (): Promise<boolean> => {
  if (
    typeof window === "undefined" ||
    !("ai" in window) ||
    !("languageModel" in window.ai) ||
    typeof window.ai.languageModel !== "object"
  ) {
    return false;
  }

  try {
    HAS_WINDOW_AI = await isAvailable(globalThis.ai.languageModel);

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
