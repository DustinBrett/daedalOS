import { GENERATE_RESPONSE } from "components/system/Taskbar/AI/constants";
import {
  type ChatHistory,
  type Message,
} from "components/system/Taskbar/AI/types";

type Thoughts = {
  answer: string;
  thinking?: boolean;
  thoughts?: string;
};

const THINK_START = "<think>";
const THINK_END = "</think>";

export const formatWebLlmProgress = (text: string): string => {
  if (text === "Start to fetch params") return "Fetching parameters";
  if (text.startsWith("Finish loading on WebGPU")) return "";

  const [, progressCurrent, progressTotal] =
    /\[(\d+)\/(\d+)\]/.exec(text) || [];

  let progress = "";

  if (!Number.isNaN(Number(progressTotal))) {
    progress = `${progressCurrent || 0}/${progressTotal}`;
  }

  if (text.startsWith("Loading model from cache")) {
    return `Loading${progress ? ` (${progress})` : ""}`;
  }

  const [, percentComplete] = /(\d+)% completed/.exec(text) || [];
  const [, secsElapsed] = /(\d+) secs elapsed/.exec(text) || [];

  if (!Number.isNaN(Number(percentComplete))) {
    progress += `${progress ? ", " : ""}${percentComplete}%`;
  }

  if (!Number.isNaN(Number(secsElapsed))) {
    progress += `${progress ? ", " : ""}${secsElapsed}s`;
  }

  if (text.startsWith("Loading GPU shader modules")) {
    return `Loading into GPU${progress ? ` (${progress})` : ""}`;
  }

  const [, dataLoaded] = /(\d+)MB (fetched|loaded)/.exec(text) || [];

  if (!Number.isNaN(Number(dataLoaded))) {
    progress += `${progress ? ", " : ""}${dataLoaded}MB`;
  }

  if (text.startsWith("Fetching param cache")) {
    return `Fetching${progress ? ` (${progress})` : ""}`;
  }

  return text;
};

export const speakMessage = (text: string): void => {
  const voice = window.speechSynthesis
    .getVoices()
    .find(({ default: isDefault }) => isDefault);
  const utterance = new SpeechSynthesisUtterance(text);

  if (voice) utterance.voice = voice;
  utterance.pitch = 0.9;
  utterance.rate = 1.5;
  utterance.volume = 0.5;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

export const escapeHtml = (unSafeHtml: string): string =>
  unSafeHtml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const splitThoughts = (text: string): Thoughts => {
  const response = text.trimStart();
  const thoughtsStart = response.startsWith(THINK_START)
    ? THINK_START.length
    : 0;
  const thoughtsEnd = response.indexOf(THINK_END);

  if (thoughtsEnd === -1) {
    return thoughtsStart
      ? { answer: "", thinking: true, thoughts: response.slice(thoughtsStart) }
      : { answer: response.trimEnd() };
  }

  return {
    answer: response.slice(thoughtsEnd + THINK_END.length).trim(),
    thoughts: response.slice(thoughtsStart, thoughtsEnd).trim(),
  };
};

export const toChatHistory = (messages: Message[]): ChatHistory =>
  messages.flatMap(({ text, type, withCanvas }) => {
    const content =
      type === "user"
        ? text
        : withCanvas
          ? GENERATE_RESPONSE
          : splitThoughts(text).answer;

    return content
      ? [{ content, role: type === "user" ? "user" : "assistant" }]
      : [];
  });
