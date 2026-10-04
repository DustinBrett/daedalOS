/// <reference types="dom-chromium-ai" />

import { type ChatCompletionMessageParam } from "@mlc-ai/web-llm";

declare global {
  interface Window {
    initialAiPrompt?: string;
  }
}

export type ChatHistory = { content: string; role: "assistant" | "user" }[];

type MessageTypes = "ai" | "user";

export type Message = {
  images?: Blob[];
  text: string;
  type: MessageTypes;
  withCanvas?: boolean;
};

export type ConvoStyles = "balanced" | "creative" | "precise";

export type ResponseError = "context" | "failed";

export type WorkerMessage =
  | "init"
  | { cancel: number }
  | {
      id: number;
      imagePrompt: string;
      offscreenCanvas: OffscreenCanvas;
    }
  | {
      id: number;
      messages: ChatCompletionMessageParam[];
      style: ConvoStyles;
    };

export type WorkerResponse =
  | { done: true; error?: ResponseError; id: number }
  | { id: number; text: string }
  | { progress: string };
