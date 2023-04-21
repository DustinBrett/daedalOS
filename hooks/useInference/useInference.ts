import type { Message } from "components/apps/Chat/types";
import { HuggingFace } from "hooks/useInference/huggingFace";
import { OpenAI } from "hooks/useInference/openAI";
import { WebLLM } from "hooks/useInference/WebLLM";
import { useMemo, useState } from "react";
import { DEFAULT_AI_API, DEFAULT_NON_WEBGPU_ENGINE } from "utils/constants";

export type Engine = {
  chat: (
    message: string,
    userMessages: string[],
    generatedMessages: string[],
    allMessages: Message[]
  ) => Promise<string>;
  classify: (text: string, categories: string[]) => Promise<string>;
  destroy?: () => void;
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
  name: string;
  resetError: () => void;
};

const Engines = { HuggingFace, OpenAI, WebLLM } as Record<string, EngineClass>;

export const useInference = (apiKey = "", engine = ""): Inference => {
  const [error, setError] = useState<number>(0);
  const [DEFAULT_ENGINE] = DEFAULT_AI_API.split(":");
  const supportsWebGPU = "gpu" in navigator;
  let activeEngine = DEFAULT_ENGINE;

  if (engine && engine in Engines) {
    activeEngine =
      engine === "WebLLM" && !supportsWebGPU
        ? DEFAULT_NON_WEBGPU_ENGINE
        : engine;
  } else if (activeEngine === "WebLLM" && !supportsWebGPU) {
    activeEngine = DEFAULT_NON_WEBGPU_ENGINE;
  }

  return {
    engine: useMemo(
      () => new Engines[activeEngine](apiKey, setError),
      [activeEngine, apiKey]
    ),
    error,
    name: activeEngine,
    resetError: () => setError(0),
  };
};
