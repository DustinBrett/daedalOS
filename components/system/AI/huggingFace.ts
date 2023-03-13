/* eslint-disable camelcase */
import type { Inference } from "components/system/AI/inference";
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
    HfInference?: new () => HfInference;
  }
}

const DEFAULT_MODELS = {
  conversational: "microsoft/DialoGPT-large",
  translation: "t5-base",
};

export class HuggingFace implements Inference {
  private inference: HfInference | undefined;

  public limitReached = false;

  public async init(): Promise<void> {
    await loadFiles(["System/AI/HuggingFace/inference.js"]);

    if (window.HfInference) {
      this.inference = new window.HfInference();
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
      this.limitReached = true;
    }
  }
}
