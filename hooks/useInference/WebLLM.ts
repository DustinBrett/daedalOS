import type { Message } from "components/apps/Chat/types";
import type { Engine } from "hooks/useInference/useInference";
import { loadFiles } from "utils/functions";

const libs = [
  "/Program Files/WebLLM/tvmjs_runtime.wasi.js",
  "/Program Files/WebLLM/tvmjs.bundle.js",
  "/Program Files/WebLLM/llm_chat.js",
];

const moduleLibs = ["/Program Files/WebLLM/sentencepiece.js"];

const runLLM = async (message: string, skipLibs = false): Promise<string> => {
  if (!skipLibs) {
    window.tvmjsGlobalEnv = window.tvmjsGlobalEnv || {};

    await loadFiles(libs);
    await loadFiles(moduleLibs, undefined, undefined, true);
  }

  globalThis.tvmjsGlobalEnv.sentencePieceProcessor = (url: string) =>
    globalThis.sentencepiece.sentencePieceProcessor(url);

  globalThis.tvmjsGlobalEnv.message = message;

  await globalThis.tvmjsGlobalEnv.asyncOnGenerate();

  return globalThis.tvmjsGlobalEnv.response;
};

const DEFAULT_GREETING = {
  text: "Hello, I am an AI assistant. How can I help you today?",
  type: "assistant",
} as Message;

export class WebLLM implements Engine {
  public greeting = DEFAULT_GREETING;

  // eslint-disable-next-line class-methods-use-this
  public destroy(): void {
    globalThis.tvmjsGlobalEnv?.asyncOnReset();
  }

  // eslint-disable-next-line class-methods-use-this
  public async init(): Promise<void> {
    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this
  public async chat(
    message: string,
    _userMessages: string[],
    _generatedMessages: string[],
    _allMessages?: Message[]
  ): Promise<string> {
    return runLLM(message);
  }

  // eslint-disable-next-line class-methods-use-this
  public async classify(_text: string, _categories: string[]): Promise<string> {
    // TODO: Implement with chat

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }

  // eslint-disable-next-line class-methods-use-this
  public async draw(_text: string): Promise<Buffer | void> {
    // TODO: Implement with WebSD

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this
  public async imageToText(
    _name: string,
    _type: string,
    _image: Buffer
  ): Promise<string> {
    // TODO: Implement with chat

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }

  // eslint-disable-next-line class-methods-use-this
  public async summarization(_text: string): Promise<string> {
    // TODO: Implement with chat

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }

  // eslint-disable-next-line class-methods-use-this
  public async translation(_text: string): Promise<string> {
    // TODO: Implement with chat

    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve("");
  }
}
