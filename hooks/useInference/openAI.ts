import type { Message } from "components/apps/Chat/types";
import type { Engine } from "hooks/useInference/useInference";

type ChatResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

const DEFAULT_MODELS = {
  conversational: "gpt-3.5-turbo", // TODO: gpt4
};

const API_URLS = {
  conversational: "https://api.openai.com/v1/chat/completions",
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
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (response?.ok) {
      const data = (await response.json()) as ChatResponse;

      return data?.choices?.[0]?.message?.content || "";
    }

    if (response?.status) this.setError(response?.status);

    return "";
  }

  // eslint-disable-next-line class-methods-use-this
  public async draw(_text: string): Promise<Buffer | void> {
    // TODO: Implement

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve();
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
