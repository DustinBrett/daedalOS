import { PICTURES_FOLDER } from "utils/constants";

export const AI_IMAGES_FOLDER = `${PICTURES_FOLDER}/AI Images`;

export const BOX_SHADOW =
  "0 0.5px 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)";

export const actionCommandsMap: Record<string, string> = {
  DRAWING: "/draw",
  SUMMARY: "/summarize",
  TRANSLATION: "/translate",
};

export const actionLabel: Record<string, string> = {
  DRAWING: "Drawing",
  SUMMARY: "Summaring",
  TRANSLATION: "Translating",
};

export const commandEmoji: Record<string, string> = {
  "/draw": "🎨",
  "/summarize": "📝",
  "/translate": "🌐",
  "/wallpaper": "🎨",
};

export const EngineErrorMessage: Record<number, string> = {
  401: "Valid API key required.",
  404: "Model not found.",
  429: "Rate limit reached.",
};
