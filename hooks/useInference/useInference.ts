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
    allMessages: Message[]
  ) => Promise<string>;
  classify: (text: string, categories: string[]) => Promise<string>;
  draw: (text: string) => Promise<Buffer | void>;
  greeting: Message;
  imageToText: (name: string, type: string, image: Buffer) => Promise<string>;
  init: () => Promise<void>;
  summarization: (text: string) => Promise<string>;
  translation: (text: string) => Promise<string>;
};

type EngineClass = new (
  apiKey: string,
  setError?: React.Dispatch<React.SetStateAction<number>>
) => Engine;

type Inference = {
  engine: Engine;
  error: number;
  resetError: () => void;
};

const Engines = { HuggingFace, OpenAI } as Record<string, EngineClass>;

export const useInference = (apiKey = "", engine = ""): Inference => {
  const [error, setError] = useState<number>(0);
  const [DEFAULT_ENGINE] = DEFAULT_AI_API.split(":");

  return {
    engine: useMemo(
      () =>
        (engine &&
          engine in Engines &&
          new Engines[engine](apiKey, setError)) ||
        new Engines[DEFAULT_ENGINE](apiKey, setError),
      [DEFAULT_ENGINE, apiKey, engine]
    ),
    error,
    resetError: () => setError(0),
  };
};
