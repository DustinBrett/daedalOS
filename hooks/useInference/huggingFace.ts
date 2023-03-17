/* eslint-disable camelcase */
import type { Message } from "components/apps/Chat/types";
import type { Engine } from "hooks/useInference/useInference";
import { bufferToBlob, loadFiles } from "utils/functions";

type HfRequestConfig = {
  wait_for_model: boolean;
};

type ImageToText = (
  options: {
    data: File;
    model: string;
  },
  config: HfRequestConfig & {
    binary: boolean;
  }
) => Promise<[{ generated_text: string }]>;

type HfInference = {
  conversational: (
    options: {
      inputs: {
        generated_responses: string[];
        past_user_inputs: string[];
        text: string;
      };
      model: string;
    },
    config: HfRequestConfig
  ) => Promise<{ generated_text: string }>;
  request: ImageToText;
  summarization: (
    options: {
      inputs: string;
      model: string;
      parameters: {
        max_length: number;
      };
    },
    config: HfRequestConfig
  ) => Promise<{ summary_text: string }>;
  textToImage: (
    options: {
      inputs: string;
      model: string;
      negative_prompt: string;
    },
    config: HfRequestConfig
  ) => Promise<Buffer>;
  translation: (
    options: {
      inputs: string;
      model: string;
    },
    config: HfRequestConfig
  ) => Promise<{ translation_text: string }>;
};

declare global {
  interface Window {
    HfInference?: new (apiKey?: string) => HfInference;
  }
}

const DEFAULT_GREETING = {
  text: "Hello, I'm an AI assistant. How can I help you?",
  type: "assistant",
} as Message;

const DEFAULT_MODELS = {
  conversational: "facebook/blenderbot-400M-distill",
  imageToText: "Salesforce/blip-image-captioning-large",
  summarization: "philschmid/bart-large-cnn-samsum",
  textToImage: "stabilityai/stable-diffusion-2-1",
  translation: "t5-base",
};

const DEFAULT_OPTIONS = { wait_for_model: true };

const SUMMARY_MAX_LENGTH = 100;

const TEXT_TO_IMAGE_NEGATIVE_PROMPT = "blurry";

export class HuggingFace implements Engine {
  private inference: HfInference | undefined;

  private setError: React.Dispatch<React.SetStateAction<number>>;

  private checkError(error: Error): void {
    if (error.message.includes("Rate limit reached")) {
      this.setError(429);
    }
  }

  public greeting = DEFAULT_GREETING;

  public constructor(setError: React.Dispatch<React.SetStateAction<number>>) {
    this.setError = setError;
  }

  public async init(apiKey?: string): Promise<void> {
    await loadFiles(["Program Files/HuggingFace/inference.js"]);

    if (window.HfInference) {
      this.inference = new window.HfInference(apiKey);
    }
  }

  public async chat(
    message: string,
    userMessages: string[],
    generatedMessages: string[]
  ): Promise<string> {
    let generated_text = "";

    try {
      ({ generated_text = "" } =
        (await this.inference?.conversational(
          {
            inputs: {
              generated_responses: generatedMessages,
              past_user_inputs: userMessages,
              text: message,
            },
            model: DEFAULT_MODELS.conversational,
          },
          DEFAULT_OPTIONS
        )) || {});
    } catch (error) {
      this.checkError(error as Error);
    }

    return generated_text;
  }

  public async draw(text: string): Promise<Buffer | void> {
    try {
      return await this.inference?.textToImage(
        {
          inputs: text,
          model: DEFAULT_MODELS.textToImage,
          negative_prompt: TEXT_TO_IMAGE_NEGATIVE_PROMPT,
        },
        DEFAULT_OPTIONS
      );
    } catch (error) {
      return this.checkError(error as Error);
    }
  }

  public async imageToText(
    name: string,
    type: string,
    image: Buffer
  ): Promise<string> {
    let generated_text = "";

    try {
      [{ generated_text = "" }] = (await this.inference?.request(
        {
          data: new File([bufferToBlob(image, type)], name, { type }),
          model: DEFAULT_MODELS.imageToText,
        },
        { ...DEFAULT_OPTIONS, binary: true }
      )) || [{}];
    } catch (error) {
      this.checkError(error as Error);
    }

    return generated_text;
  }

  public async summarization(text: string): Promise<string> {
    let summary_text = "";

    try {
      ({ summary_text = "" } =
        (await this.inference?.summarization(
          {
            inputs: text,
            model: DEFAULT_MODELS.summarization,
            parameters: {
              max_length: SUMMARY_MAX_LENGTH,
            },
          },
          DEFAULT_OPTIONS
        )) || {});
    } catch (error) {
      this.checkError(error as Error);
    }

    return summary_text;
  }

  public async translation(text: string): Promise<string> {
    let translation_text = "";

    try {
      ({ translation_text = "" } =
        (await this.inference?.translation(
          {
            inputs: text,
            model: DEFAULT_MODELS.translation,
          },
          DEFAULT_OPTIONS
        )) || {});
    } catch (error) {
      this.checkError(error as Error);
    }

    return translation_text;
  }
}
