import type { Engine } from "components/apps/Chat/AI/useInference";
import type { Message } from "components/apps/Chat/types";

type ChatResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

const DEFAULT_MODELS = {
  conversational: "gpt-3.5-turbo",
};

const API_URLS = {
  conversational: "https://api.openai.com/v1/chat/completions",
};

const SYSTEM_MESSAGE = {
  content: "You are a helpful assistant.",
  role: "system",
};

export class OpenAI implements Engine {
  private setError: React.Dispatch<React.SetStateAction<number>>;

  private apiKey = "";

  public greeting = {
    text: "Hello, how can I help you?",
    type: "assistant",
  } as Message;

  public constructor(setError: React.Dispatch<React.SetStateAction<number>>) {
    this.setError = setError;
  }

  public async init(apiKey = ""): Promise<void> {
    this.apiKey = apiKey;

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this
  public async translation(_text: string): Promise<string> {
    // TODO: Implement translation

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
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

    if (response?.status) {
      this.setError(response?.status);
    }

    return "";
  }

  private checkError(error: Error): void {
    if (error.message.includes("You exceeded your current quota")) {
      this.setError(429);
    } else if (error.message.includes("You didn't provide an API key")) {
      this.setError(401);
    }
  }
}
