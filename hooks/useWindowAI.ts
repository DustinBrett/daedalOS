import { useEffect, useState } from "react";
import { useAiEnabled, useSessionLoaded } from "contexts/session";

const LANGUAGES = ["en"];

export const TEXT_EXPECTATIONS = {
  expectedInputs: [{ languages: LANGUAGES, type: "text" }],
  expectedOutputs: [{ languages: LANGUAGES, type: "text" }],
} satisfies LanguageModelCreateCoreOptions;

export const IMAGE_EXPECTATIONS = {
  ...TEXT_EXPECTATIONS,
  expectedInputs: [...TEXT_EXPECTATIONS.expectedInputs, { type: "image" }],
} satisfies LanguageModelCreateCoreOptions;

export const getAvailability = async (
  options: LanguageModelCreateCoreOptions = TEXT_EXPECTATIONS
): Promise<Availability> => {
  if (typeof window === "undefined" || !("LanguageModel" in window)) {
    return "unavailable";
  }

  try {
    return await LanguageModel.availability(options);
  } catch {
    return "unavailable";
  }
};

let cachedAvailability: Availability = "unavailable";
let availabilityCheck: Promise<Availability> | undefined;

export const useWindowAI = (): Availability => {
  const [availability, setAvailability] = useState(cachedAvailability);

  useEffect(() => {
    availabilityCheck ||= getAvailability().then((newAvailability) => {
      cachedAvailability = newAvailability;

      return newAvailability;
    });
    availabilityCheck.then(setAvailability);
  }, []);

  return availability;
};

export const useShowAI = (): boolean => {
  const aiEnabled = useAiEnabled();
  const sessionLoaded = useSessionLoaded();
  const windowAI = useWindowAI();

  // Waits for the session so a saved choice to hide it doesn't flash
  return aiEnabled ?? (sessionLoaded && windowAI === "available");
};
