/* eslint-disable camelcase */
import type {
  Args,
  ImageClassificationArgs,
  Options,
  TextGenerationReturn,
} from "@huggingface/inference";
import { HfInference } from "@huggingface/inference";
import type { Message } from "components/apps/Chat/types";
import type { Engine } from "hooks/useInference/useInference";
import { bufferToBlob } from "utils/functions";

type ImageToText = (
  options: Args & ImageClassificationArgs,
  config: Options & {
    binary: boolean;
  }
) => Promise<TextGenerationReturn[]>;

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
  zeroShotClassification: "facebook/bart-large-mnli",
};

const DEFAULT_OPTIONS = { wait_for_model: true } as Options;

const SUMMARY_MAX_LENGTH = 100;

const TEXT_TO_IMAGE_NEGATIVE_PROMPT = "blurry";

export class HuggingFace implements Engine {
  private inference: HfInference;

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
    this.inference = new HfInference(apiKey);
    this.setError = setError;
  }

  public async chat(
    message: string,
    userMessages: string[],
    generatedMessages: string[]
  ): Promise<string> {
    let generated_text = "";

    try {
      ({ generated_text = "" } =
        (await this.inference.conversational(
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
      return (await this.inference.textToImage(
        {
          inputs: text,
          model: DEFAULT_MODELS.textToImage,
          negative_prompt: TEXT_TO_IMAGE_NEGATIVE_PROMPT,
        },
        DEFAULT_OPTIONS
      )) as unknown as Buffer;
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
      const [{ generated_text }] = await (
        this.inference.request as ImageToText
      )(
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
