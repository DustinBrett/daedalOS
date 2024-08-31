import { type ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { type MarkedOptions } from "components/apps/Marked/useMarked";

type AIAssistantPromptOptions = {
  signal?: AbortSignal;
};

export type AITextSession = {
  destroy: () => void;
  prompt: (
    message: string,
    options?: AIAssistantPromptOptions
  ) => Promise<string>;
};

export type AITextSessionOptions = {
  initialPrompts?: ChatCompletionMessageParam[];
  systemPrompt?: string;
  temperature: number;
  topK: number;
};

type AICapabilityAvailability = "readily" | "after-download" | "no";

type AI = {
  assistant: {
    capabilities: () => Promise<{ available: AICapabilityAvailability }>;
    create: (config?: Partial<AITextSessionOptions>) => Promise<AITextSession>;
  };
};

declare global {
  /* eslint-disable vars-on-top, no-var  */
  var ai: AI;
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
