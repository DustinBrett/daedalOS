import { type ConvoStyles } from "components/system/Taskbar/AI/types";

export const AI_TITLE = "Talos";

export const AI_STAGE = "alpha";

export const AI_DISPLAY_TITLE = `${AI_TITLE} (${AI_STAGE})`;

export const DEFAULT_CONVO_STYLE: ConvoStyles = "balanced";

export const AI_WORKER = (): Worker =>
  new Worker(
    new URL("components/system/Taskbar/AI/ai.worker", import.meta.url),
    { name: "AI" }
  );

export const WINDOW_ID = "ai-chat-window";
