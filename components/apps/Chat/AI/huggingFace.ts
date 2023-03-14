/* eslint-disable camelcase */
import type { Engine } from "components/apps/Chat/AI/useInference";
import type { Message } from "components/apps/Chat/types";
import { loadFiles } from "utils/functions";

type HfInference = {
  conversational: (options: {
    inputs: {
      generated_responses: string[];
      past_user_inputs: string[];
      text: string;
    };
    model: string;
  }) => Promise<{ generated_text: string }>;
  translation: (options: {
    inputs: string;
    model: string;
  }) => Promise<{ translation_text: string }>;
};

declare global {
  interface Window {
    HfInference?: new (apiKey?: string) => HfInference;
  }
}

const DEFAULT_MODELS = {
  conversational: "facebook/blenderbot-400M-distill",
  translation: "t5-base",
};

export class HuggingFace implements Engine {
  private inference: HfInference | undefined;

  private setError: React.Dispatch<React.SetStateAction<number>>;

  public greeting = {
    text: "Hello, I'm an AI assistant. How can I help you?",
    type: "assistant",
  } as Message;

  public constructor(setError: React.Dispatch<React.SetStateAction<number>>) {
    this.setError = setError;
  }

  public async init(apiKey?: string): Promise<void> {
    await loadFiles(["Program Files/HuggingFace/inference.js"]);

    if (window.HfInference) {
      this.inference = new window.HfInference(apiKey);
    }
  }

  public async translation(text: string): Promise<string> {
    let translation_text = "";

    try {
      ({ translation_text = "" } =
        (await this.inference?.translation({
          inputs: text,
          model: DEFAULT_MODELS.translation,
        })) || {});
    } catch (error) {
      this.checkError(error as Error);
    }

    return translation_text;
  }

  public async chat(
    message: string,
    userMessages: string[],
    generatedMessages: string[]
  ): Promise<string> {
    let generated_text = "";

    try {
      ({ generated_text = "" } =
        (await this.inference?.conversational({
          inputs: {
            generated_responses: generatedMessages,
            past_user_inputs: userMessages,
            text: message,
          },
          model: DEFAULT_MODELS.conversational,
        })) || {});
    } catch (error) {
      this.checkError(error as Error);
    }

    return generated_text;
  }

  private checkError(error: Error): void {
    if (error.message.includes("Rate limit reached")) {
      this.setError(429);
    }
  }
}
