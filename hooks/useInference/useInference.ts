import type { Message } from "components/apps/Chat/types";
import { WebLLM } from "hooks/useInference/WebLLM";
import { HuggingFace } from "hooks/useInference/huggingFace";
import { OpenAI } from "hooks/useInference/openAI";
import { useWebGPUCheck } from "hooks/useWebGPUCheck";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_AI_API, DEFAULT_NON_WEBGPU_ENGINE } from "utils/constants";

export type Engine = {
  chat: (
    message: string,
    userMessages: string[],
    generatedMessages: string[],
    allMessages: Message[],
    stausLogger?: (type: string, msg: string) => void,
    systemPrompt?: string
  ) => Promise<string>;
  classify: (text: string, categories: string[]) => Promise<string>;
  destroy?: () => void;
  draw: (text: string) => Promise<Buffer | void>;
  greeting: Message;
  imageToText: (name: string, type: string, image: Buffer) => Promise<string>;
  init: () => Promise<void>;
  reset?: () => void;
  summarization: (text: string) => Promise<string>;
  translation: (text: string) => Promise<string>;
};

type EngineClass = new (
  apiKey: string,
  setError?: React.Dispatch<React.SetStateAction<number>>
) => Engine;

type Inference = {
  engine?: Engine;
  error: number;
  name: string;
  resetError: () => void;
};

const Engines = {
  HuggingFace,
  OpenAI,
  "WebLLM [RedPajama 3B]": WebLLM,
  "WebLLM [Vicuna 7B]": WebLLM,
} as Record<string, EngineClass>;

export const useInference = (apiKey = "", engine = ""): Inference => {
  const [error, setError] = useState<number>(0);
  const hasWebGPU = useWebGPUCheck();
  const [activeEngine, setActiveEngine] = useState<string>("");

  useEffect(() => {
    if (typeof hasWebGPU === "boolean") {
      const [DEFAULT_ENGINE] = DEFAULT_AI_API.split(":");
      let currentEngine = DEFAULT_ENGINE;

      if (engine && engine in Engines) {
        currentEngine =
          engine.startsWith("WebLLM") && !hasWebGPU
            ? DEFAULT_NON_WEBGPU_ENGINE
            : engine;
      } else if (currentEngine.startsWith("WebLLM") && !hasWebGPU) {
        currentEngine = DEFAULT_NON_WEBGPU_ENGINE;
      }

      setActiveEngine(currentEngine);
    }
  }, [engine, hasWebGPU]);

  return {
    engine: useMemo(
      () =>
        activeEngine
          ? new Engines[activeEngine](
              engine === activeEngine ? apiKey : "",
              setError
            )
          : undefined,
      [activeEngine, apiKey, engine]
    ),
    error,
    name: activeEngine,
    resetError: () => setError(0),
  };
};
