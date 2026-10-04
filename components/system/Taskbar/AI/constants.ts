import { type ConvoStyles } from "components/system/Taskbar/AI/types";

export const DEFAULT_CONVO_STYLE: ConvoStyles = "balanced";

export const SYSTEM_PROMPT = "You are a helpful AI assistant.";

export const GENERATE_RESPONSE = "I'll try to create that.";

export const AI_WORKER = (): Worker =>
  new Worker(
    new URL("components/system/Taskbar/AI/ai.worker", import.meta.url),
    { name: "AI" }
  );
