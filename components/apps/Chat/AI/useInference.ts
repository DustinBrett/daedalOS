import { HuggingFace } from "components/apps/Chat/AI/huggingFace";
import { useMemo, useState } from "react";

export type Inference = {
  chat: (
    message: string,
    userMessages: string[],
    generatedMessages: string[]
  ) => Promise<string>;
  init: () => Promise<void>;
  translation: (text: string) => Promise<string>;
};

const Engines = { HuggingFace } as Record<
  string,
  new (setError?: React.Dispatch<React.SetStateAction<number>>) => Inference
>;

const DEFAULT_ENGINE = "HuggingFace";

export const useInference = (
  engine?: string
): { engine?: Inference; error: number } => {
  const [error, setError] = useState<number>(0);

  return {
    engine: useMemo(
      () =>
        (engine && engine in Engines && new Engines[engine](setError)) ||
        new Engines[DEFAULT_ENGINE](setError),
      [engine]
    ),
    error,
  };
};
