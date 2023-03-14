import { HuggingFace } from "components/apps/Chat/AI/huggingFace";
import { OpenAI } from "components/apps/Chat/AI/openAI";
import type { Message } from "components/apps/Chat/types";
import { useMemo, useState } from "react";

export type Engine = {
  chat: (
    message: string,
    userMessages: string[],
    generatedMessages: string[],
    allMessages?: Message[]
  ) => Promise<string>;
  greeting: Message;
  init: (apiKey?: string) => Promise<void>;
  translation: (text: string) => Promise<string>;
};

export type Inference = {
  engine?: Engine;
  error: number;
  resetError: () => void;
};

export const EngineErrorMessage: Record<number, string> = {
  401: "Valid API key required.",
  429: "Rate limit reached.",
};

const Engines = { HuggingFace, OpenAI } as Record<
  string,
  new (setError?: React.Dispatch<React.SetStateAction<number>>) => Engine
>;

const DEFAULT_ENGINE = "OpenAI";

export const useInference = (engine?: string): Inference => {
  const [error, setError] = useState<number>(0);

  return {
    engine: useMemo(
      () =>
        (engine && engine in Engines && new Engines[engine](setError)) ||
        new Engines[DEFAULT_ENGINE](setError),
      [engine]
    ),
    error,
    resetError: () => setError(0),
  };
};
