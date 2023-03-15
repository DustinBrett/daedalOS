import type { Message } from "components/apps/Chat/types";
import { HuggingFace } from "hooks/useInference/huggingFace";
import { OpenAI } from "hooks/useInference/openAI";
import { useMemo, useState } from "react";
import { DEFAULT_AI_API } from "utils/constants";

export type Engine = {
  chat: (
    message: string,
    userMessages: string[],
    generatedMessages: string[],
    allMessages?: Message[]
  ) => Promise<string>;
  draw: (text: string) => Promise<Buffer | void>;
  greeting: Message;
  init: (apiKey?: string) => Promise<void>;
  summarization: (text: string) => Promise<string>;
  translation: (text: string) => Promise<string>;
};

type Inference = {
  engine?: Engine;
  error: number;
  resetError: () => void;
};

const Engines = { HuggingFace, OpenAI } as Record<
  string,
  new (setError?: React.Dispatch<React.SetStateAction<number>>) => Engine
>;

export const useInference = (engine?: string): Inference => {
  const [error, setError] = useState<number>(0);
  const [DEFAULT_ENGINE] = DEFAULT_AI_API.split(":");

  return {
    engine: useMemo(
      () =>
        (engine && engine in Engines && new Engines[engine](setError)) ||
        new Engines[DEFAULT_ENGINE](setError),
      [DEFAULT_ENGINE, engine]
    ),
    error,
    resetError: () => setError(0),
  };
};
