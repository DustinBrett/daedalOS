import type { Message } from "components/apps/Chat/types";
import type { Engine } from "hooks/useInference/useInference";

type ChatResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

type ImageResponse = {
  data: {
    b64_json: string;
  }[];
};

const DEFAULT_MODELS = {
  conversational: "gpt-3.5-turbo", // TODO: gpt-4
};

const API_URLS = {
  conversational: "https://api.openai.com/v1/chat/completions",
  textToImage: "https://api.openai.com/v1/images/generations",
};

const SYSTEM_MESSAGE = {
  content: "You are a helpful assistant.",
  role: "system",
};

const DEFAULT_GREETING = {
  text: "Hello, how can I help you?",
  type: "assistant",
} as Message;

export class OpenAI implements Engine {
  private setError: React.Dispatch<React.SetStateAction<number>>;

  private apiKey = "";

  private getHeaders(): RequestInit {
    return {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    };
  }

  public greeting = DEFAULT_GREETING;

  public constructor(setError: React.Dispatch<React.SetStateAction<number>>) {
    this.setError = setError;
  }

  public async init(apiKey = ""): Promise<void> {
    this.apiKey = apiKey;

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve();
  }

  public async chat(
    message: string,
    _userMessages: string[],
    _generatedMessages: string[],
    allMessages?: Message[]
  ): Promise<string> {
    const messages = (allMessages || []).map(({ text, type }) => ({
      content: text,
      role: type,
    }));
    const response = await fetch(API_URLS.conversational, {
      body: JSON.stringify({
        messages: [
          SYSTEM_MESSAGE,
          ...messages,
          { content: message, role: "user" },
        ],
        model: DEFAULT_MODELS.conversational,
      }),
      ...this.getHeaders(),
    });

    if (response?.ok) {
      const data = (await response.json()) as ChatResponse;

      return data?.choices?.[0]?.message?.content || "";
    }

    if (response?.status) this.setError(response?.status);

    return "";
  }

  public async draw(text: string): Promise<Buffer | void> {
    const response = await fetch(API_URLS.textToImage, {
      body: JSON.stringify({
        n: 1,
        prompt: text,
        response_format: "b64_json",
        size: "256x256",
      }),
      ...this.getHeaders(),
    });

    if (response?.ok) {
      const data = (await response.json()) as ImageResponse;
      const imageUrl = data?.data?.[0]?.b64_json;

      return imageUrl ? Buffer.from(imageUrl, "base64") : undefined;
    }

    if (response?.status) this.setError(response?.status);

    return undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  public async imageToText(
    _name: string,
    _type: string,
    _image: Buffer
  ): Promise<string> {
    // TODO: Implement

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }

  // eslint-disable-next-line class-methods-use-this
  public async summarization(_text: string): Promise<string> {
    // TODO: Implement

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }

  // eslint-disable-next-line class-methods-use-this
  public async translation(_text: string): Promise<string> {
    // TODO: Implement

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }
}
