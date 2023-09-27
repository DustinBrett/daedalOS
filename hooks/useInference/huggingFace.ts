import type { Message } from "components/apps/Chat/types";
import type { Engine } from "hooks/useInference/useInference";
import { bufferToBlob, loadFiles } from "utils/functions";

interface Args {
  model: string;
}

interface Options {
  wait_for_model?: boolean;
}

interface TextGenerationReturn {
  generated_text: string;
}

type ImageClassificationArgs = Args & {
  data: ArrayBuffer | Blob;
};

type ImageToText = (
  options: Args & ImageClassificationArgs,
  config: Options & {
    binary: boolean;
  }
) => Promise<TextGenerationReturn[]>;

type TextGenerationModelSettings = {
  assistantStartToken: string;
  endToken: string;
  userStartToken: string;
};

type HfInference = {
  conversational: (
    args: {
      inputs: {
        generated_responses: string[];
        past_user_inputs: string[];
        text: string;
      };
      model: string;
    },
    options: Options
  ) => Promise<TextGenerationReturn>;
  request: ImageToText;
  summarization: (
    args: {
      inputs: string;
      model: string;
      parameters: {
        max_length: number;
      };
    },
    options: Options
  ) => Promise<{ summary_text: string }>;
  textGeneration: (
    args: {
      inputs: string;
      model: string;
      parameters: {
        max_new_tokens: number;
        return_full_text: boolean;
      };
    },
    options: Options
  ) => Promise<TextGenerationReturn>;
  textToImage: (
    args: {
      inputs: string;
      model: string;
      negative_prompt: string;
    },
    options: Options
  ) => Promise<Blob>;
  translation: (
    args: {
      inputs: string;
      model: string;
    },
    options: Options
  ) => Promise<{ translation_text: string }>;
  zeroShotClassification: (
    args: {
      inputs: [string];
      model: string;
      parameters: { candidate_labels: string[] };
    },
    options: Options
  ) => Promise<
    {
      labels: string[];
      scores: number[];
    }[]
  >;
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

const DEFAULT_MODELS: Record<string, string> = {
  chat: "textGeneration",
  conversational: "facebook/blenderbot-400M-distill",
  imageToText: "Salesforce/blip-image-captioning-large",
  summarization: "philschmid/bart-large-cnn-samsum",
  textGeneration: "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5",
  textToImage: "stabilityai/stable-diffusion-2-1",
  translation: "t5-base",
  zeroShotClassification: "facebook/bart-large-mnli",
};

const TEXT_GENERATION_MODEL_SETTINGS: Record<
  string,
  TextGenerationModelSettings
> = {
  "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5": {
    assistantStartToken: "<|assistant|>",
    endToken: "<|endoftext|>",
    userStartToken: "<|prompter|>",
  },
};

const convertToConversation = (
  message: string,
  allMessages: Message[]
): string => {
  const { assistantStartToken, endToken, userStartToken } =
    TEXT_GENERATION_MODEL_SETTINGS[DEFAULT_MODELS.textGeneration];

  return `${[...allMessages, { text: message, type: "user" }]
    .filter(({ type }) => type !== "system")
    .map(
      ({ text, type }) =>
        `${
          type === "assistant" ? assistantStartToken : userStartToken
        }${text}${endToken}`
    )
    .join("")}${assistantStartToken}`;
};

const DEFAULT_OPTIONS = { wait_for_model: true } as Options;

const SUMMARY_MAX_LENGTH = 100;

const TEXT_TO_IMAGE_NEGATIVE_PROMPT = "blurry";

export class HuggingFace implements Engine {
  private inference = {} as HfInference;

  private apiKey: string;

  private setError: React.Dispatch<React.SetStateAction<number>>;

  private checkError(error: Error): void {
    if (error.message.includes("Rate limit reached")) {
      this.setError(429);
    }
  }

  public greeting = DEFAULT_GREETING;

  public constructor(
    apiKey: string,
    setError: React.Dispatch<React.SetStateAction<number>>
  ) {
    this.apiKey = apiKey;
    this.setError = setError;
  }

  public async init(): Promise<void> {
    await loadFiles(["Program Files/HuggingFace/inference.min.js"]);

    if (window.HfInference) {
      this.inference = new window.HfInference(this.apiKey);
    }
  }

  public async chat(
    message: string,
    userMessages: string[],
    generatedMessages: string[],
    allMessages: Message[]
  ): Promise<string> {
    let generated_text = "";
    const model = DEFAULT_MODELS[DEFAULT_MODELS.chat];

    try {
      if (DEFAULT_MODELS.chat === "conversational") {
        ({ generated_text = "" } = await this.inference.conversational(
          {
            inputs: {
              generated_responses: generatedMessages,
              past_user_inputs: userMessages,
              text: message,
            },
            model,
          },
          DEFAULT_OPTIONS
        ));
      } else {
        ({ generated_text = "" } = await this.inference.textGeneration(
          {
            inputs: convertToConversation(message, allMessages),
            model,
            parameters: {
              max_new_tokens: 100,
              return_full_text: false,
            },
          },
          DEFAULT_OPTIONS
        ));
      }
    } catch (error) {
      this.checkError(error as Error);
    }

    return generated_text;
  }

  public async classify(text: string, categories: string[]): Promise<string> {
    try {
      const [
        {
          labels: [topLabel],
          scores: [topScore],
        },
      ] = await this.inference.zeroShotClassification(
        {
          inputs: [text],
          model: DEFAULT_MODELS.zeroShotClassification,
          parameters: { candidate_labels: categories },
        },
        DEFAULT_OPTIONS
      );

      return `${topLabel} (${(topScore * 100).toFixed(1)}%)`;
    } catch (error) {
      this.checkError(error as Error);
    }

    return "";
  }

  public async draw(text: string): Promise<Buffer | void> {
    try {
      const image = await this.inference.textToImage(
        {
          inputs: text,
          model: DEFAULT_MODELS.textToImage,
          negative_prompt: TEXT_TO_IMAGE_NEGATIVE_PROMPT,
        },
        DEFAULT_OPTIONS
      );

      return Buffer.from(await image.arrayBuffer());
    } catch (error) {
      return this.checkError(error as Error);
    }
  }

  public async imageToText(
    name: string,
    type: string,
    image: Buffer
  ): Promise<string> {
    try {
      const [{ generated_text }] = await this.inference.request(
        {
          data: new File([bufferToBlob(image, type)], name, { type }),
          model: DEFAULT_MODELS.imageToText,
        },
        { ...DEFAULT_OPTIONS, binary: true }
      );

      return generated_text;
    } catch (error) {
      this.checkError(error as Error);
    }

    return "";
  }

  public async summarization(text: string): Promise<string> {
    try {
      return (
        await this.inference.summarization(
          {
            inputs: text,
            model: DEFAULT_MODELS.summarization,
            parameters: {
              max_length: SUMMARY_MAX_LENGTH,
            },
          },
          DEFAULT_OPTIONS
        )
      ).summary_text;
    } catch (error) {
      this.checkError(error as Error);
    }

    return "";
  }

  public async translation(text: string): Promise<string> {
    try {
      return (
        await this.inference.translation(
          {
            inputs: text,
            model: DEFAULT_MODELS.translation,
          },
          DEFAULT_OPTIONS
        )
      ).translation_text;
    } catch (error) {
      this.checkError(error as Error);
    }

    return "";
  }
}
