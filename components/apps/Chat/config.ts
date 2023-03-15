export const BOX_SHADOW =
  "0 0.5px 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)";

export const commandEmoji: Record<string, string> = {
  "/draw": "🎨",
  "/summarize": "📝",
  "/translate": "🌐",
};

export const EngineErrorMessage: Record<number, string> = {
  401: "Valid API key required.",
  404: "Model not found.",
  429: "Rate limit reached.",
};
