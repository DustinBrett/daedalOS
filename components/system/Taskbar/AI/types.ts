/// <reference types="dom-chromium-ai" />

import { type MarkedOptions } from "components/apps/Marked/useMarked";

declare global {
  /* eslint-disable vars-on-top, no-var  */
  var ai: { assistant: AIAssistantFactory };
  var marked: {
    parse: (markdownString: string, options: MarkedOptions) => string;
  };
  /* eslint-enable vars-on-top, no-var */
}

export type MessageTypes = "user" | "ai";

export type Message = {
  formattedText: string;
  text: string;
  type: MessageTypes;
};

export type ConvoStyles = "balanced" | "creative" | "precise";

export type WorkerMessage = {
  hasWindowAI: boolean;
  id: number;
  style: ConvoStyles;
  text: string;
};

export type AIResponse = { formattedResponse: string; response: string };

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
