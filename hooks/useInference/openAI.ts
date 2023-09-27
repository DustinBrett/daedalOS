import type { Message } from "components/apps/Chat/types";
import type { Engine } from "hooks/useInference/useInference";

type ChatResponse = {
  choices: {
    finish_reason: "content_filter" | "length" | "stop";
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
  conversational: "gpt-4",
};

const CHAT_MODEL_SETTINGS = {
  model: DEFAULT_MODELS.conversational,
  n: 1,
  temperature: 0.8,
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
  text: "Hello, I am an AI assistant. How can I help you today?",
  type: "assistant",
} as Message;

export class OpenAI implements Engine {
  private apiKey = "";

  private setError: React.Dispatch<React.SetStateAction<number>>;

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

  public constructor(
    apiKey: string,
    setError: React.Dispatch<React.SetStateAction<number>>
  ) {
    this.apiKey = apiKey;
    this.setError = setError;
  }

  public async init(): Promise<void> {
    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve();
  }

  public async chat(
    message: string,
    _userMessages: string[],
    _generatedMessages: string[],
    allMessages?: Message[],
    _statusLogger?: (type: string, msg: string) => void,
    systemPrompt?: string
  ): Promise<string> {
    if (systemPrompt && SYSTEM_MESSAGE.content !== systemPrompt) {
      SYSTEM_MESSAGE.content = systemPrompt;
    }

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

        ...CHAT_MODEL_SETTINGS,
      }),
      ...this.getHeaders(),
    });

    if (response?.ok) {
      const data = (await response.json()) as ChatResponse;
      const [{ message: responseMessage, finish_reason }] = data?.choices || [];

      if (responseMessage) {
        const { content } = responseMessage;

        if (finish_reason === "stop") return content;
        if (finish_reason === "length") {
          return `${content}\n\n[Incomplete Response]`;
        }
        if (finish_reason === "content_filter") {
          return `${content}\n\n[Content Filtered]`;
        }
      }
    }

    if (response?.status) this.setError(response?.status);

    return "";
  }

  public async classify(_text: string, _categories: string[]): Promise<string> {
    // TODO: Implement with chat

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
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

  public async imageToText(
    _name: string,
    _type: string,
    _image: Buffer
  ): Promise<string> {
    // TODO: Implement with chat

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }

  public async summarization(_text: string): Promise<string> {
    // TODO: Implement with chat

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }

  public async translation(_text: string): Promise<string> {
    // TODO: Implement with chat

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }
}
