/// <reference types="dom-chromium-ai" />

import { type ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { type MarkedOptions } from "components/apps/Marked/useMarked";

declare global {
  /* eslint-disable vars-on-top, no-var  */
  var ai: {
    languageModel: AILanguageModelFactory;
    summarizer: AISummarizerFactory;
  };
  var marked: {
    parse: (markdownString: string, options: MarkedOptions) => string;
  };
  /* eslint-enable vars-on-top, no-var */
  interface Window {
    initialAiPrompt?: string;
  }
}

export type MessageTypes = "user" | "ai";

export type Message = {
  formattedText: string;
  text: string;
  type: MessageTypes;
  withCanvas?: boolean;
};

export type ConvoStyles = "balanced" | "creative" | "precise";

export type WorkerMessage = {
  hasWindowAI: boolean;
  id: number;
  imagePrompt?: string;
  offscreenCanvas?: OffscreenCanvas;
  streamId?: number;
  style: ConvoStyles;
  summarizeText?: string;
  text: string;
};

export type AIResponse = {
  complete?: boolean;
  formattedResponse: string;
  response: string;
  streamId?: number;
};

export type WebLlmProgress = {
  progress: {
    progress: number;
    text: string;
    timeElapsed: number;
  };
};

export type WorkerResponse = {
  data: AIResponse | WebLlmProgress | "canceled";
};

export type Prompt = (AILanguageModelPrompt | ChatCompletionMessageParam) & {
  streamId?: number;
};
