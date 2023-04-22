import type { Message } from "components/apps/Chat/types";
import type { Engine } from "hooks/useInference/useInference";

const DEFAULT_GREETING = {
  text: "Hello, I am an AI assistant. How can I help you today?",
  type: "assistant",
} as Message;

export class WebLLM implements Engine {
  private worker?: Worker = undefined;

  public greeting = DEFAULT_GREETING;

  public destroy(): void {
    globalThis.tvmjsGlobalEnv?.asyncOnReset();
    this.worker?.terminate();
  }

  public async init(): Promise<void> {
    this.worker = new Worker(
      new URL("hooks/useInference/WebLLM.worker.ts", import.meta.url),
      { name: "WebLLM" }
    );
    this.worker.postMessage("init");

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve();
  }

  public async chat(
    message: string,
    _userMessages: string[],
    _generatedMessages: string[],
    _allMessages?: Message[]
  ): Promise<string> {
    requestAnimationFrame(() => this.worker?.postMessage(message));

    return new Promise((resolve) => {
      this.worker?.addEventListener("message", ({ data }: { data: string }) =>
        resolve(data)
      );
    });
  }

  public async classify(_text: string, _categories: string[]): Promise<string> {
    // TODO: Implement with chat

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }

  public async draw(_text: string): Promise<Buffer | void> {
    // TODO: Implement with WebSD

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve();
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
