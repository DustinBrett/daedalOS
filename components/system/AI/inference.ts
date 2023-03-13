import { HuggingFace } from "components/system/AI/huggingFace";

export type Inference = {
  chat: (
    message: string,
    userMessages: string[],
    generatedMessages: string[]
  ) => Promise<string>;
  init: () => Promise<void>;
  limitReached: boolean;
  translation: (text: string) => Promise<string>;
};

const Engines = { HuggingFace } as Record<
  string,
  new (apiKey?: string) => Inference
>;

const DEFAULT_ENGINE = "HuggingFace";

let loadedEngine: Inference | undefined;

export const inference = (apiKey?: string, engine?: string): Inference => {
  if (loadedEngine) return loadedEngine;

  loadedEngine =
    (engine && engine in Engines && new Engines[engine](apiKey)) ||
    new Engines[DEFAULT_ENGINE](apiKey);

  return loadedEngine;
};
