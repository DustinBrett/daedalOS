import { type MarkedOptions } from "components/apps/Marked/useMarked";

export type Session = {
  destroy: () => void;
  prompt: (message: string) => Promise<string>;
};

declare global {
  /* eslint-disable vars-on-top, no-var  */
  var ai: {
    canCreateTextSession: () => Promise<string>;
    createTextSession: (config?: {
      temperature?: number;
      topK?: number;
    }) => Promise<Session>;
  };
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
