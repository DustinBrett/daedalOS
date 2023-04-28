import { PICTURES_FOLDER } from "utils/constants";

export const AI_IMAGES_FOLDER = `${PICTURES_FOLDER}/AI Images`;

export const BOX_SHADOW =
  "0 0.5px 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)";

type Command = {
  action: string;
  icon: string;
  label: string;
};

export const commandMap: Record<string, Command> = {
  "/caption": {
    action: "CAPTIONING",
    icon: "📝",
    label: "Captioning",
  },
  "/classify": {
    action: "CLASSIFYING",
    icon: "🏷️",
    label: "Classifying",
  },
  "/draw": {
    action: "DRAWING",
    icon: "🎨",
    label: "Drawing",
  },
  "/summarize": {
    action: "SUMMARY",
    icon: "📋",
    label: "Summarizing",
  },
  "/translate": {
    action: "TRANSLATION",
    icon: "🌐",
    label: "Translating",
  },
  "/wallpaper": {
    action: "DRAWING",
    icon: "🖼️",
    label: "Creating Wallpaper",
  },
};

export const EngineErrorMessage: Record<number, string> = {
  401: "Valid API key required.",
  404: "Model not found.",
  429: "Rate limit reached.",
};
