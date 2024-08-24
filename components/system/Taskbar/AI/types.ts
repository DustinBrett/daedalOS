import { type MarkedOptions } from "components/apps/Marked/useMarked";

export type AITextSession = {
  destroy: () => void;
  prompt: (message: string) => Promise<string>;
};

type AITextSessionOptions = {
  temperature: number;
  topK: number;
};

type AIModelAvailability = "readily" | "after-download" | "no";

type OldAiApi = {
  canCreateTextSession?: () => Promise<AIModelAvailability>;
  createTextSession?: (
    config?: Partial<AITextSessionOptions>
  ) => Promise<AITextSession>;
};

// Chrome canary 129.0.6667.0+
type NewAiApi = {
  assistant?: {
    capabilities: () => Promise<{ available: AIModelAvailability }>;
    create: (config?: Partial<AITextSessionOptions>) => Promise<AITextSession>;
  };
};

type AI = OldAiApi & NewAiApi;

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
