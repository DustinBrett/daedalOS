import { SYSTEM_PROMPT } from "components/system/Taskbar/AI/constants";
import {
  type ChatHistory,
  type ConvoStyles,
} from "components/system/Taskbar/AI/types";
import { IMAGE_EXPECTATIONS, TEXT_EXPECTATIONS } from "hooks/useWindowAI";

type Progress = (message: string) => void;

type TextUpdate = (text: string) => void;

const SAMPLING_MODES: Record<ConvoStyles, LanguageModelSamplingMode> = {
  balanced: "balanced",
  creative: "creative",
  precise: "predictable",
};

const SUMMARIZER_OPTIONS = {
  expectedInputLanguages: ["en"],
  outputLanguage: "en",
} satisfies SummarizerCreateCoreOptions;

const monitorProgress =
  (onProgress: Progress): CreateMonitorCallback =>
  (monitor) =>
    monitor.addEventListener("downloadprogress", ({ loaded }) =>
      onProgress(
        loaded < 1 ? `Downloading (${Math.floor(loaded * 100)}%)` : "Loading"
      )
    );

export const readStream = async (
  stream: ReadableStream<string>,
  onText: TextUpdate
): Promise<string> => {
  let text = "";

  for await (const chunk of stream) {
    text += chunk;
    onText(text);
  }

  return text;
};

export const createSession = (
  style: ConvoStyles,
  imageInput: boolean,
  history: ChatHistory,
  signal: AbortSignal,
  onProgress: Progress
): Promise<LanguageModel> =>
  LanguageModel.create({
    ...(imageInput ? IMAGE_EXPECTATIONS : TEXT_EXPECTATIONS),
    initialPrompts: [{ content: SYSTEM_PROMPT, role: "system" }, ...history],
    monitor: monitorProgress(onProgress),
    samplingMode: SAMPLING_MODES[style],
    signal,
  });

export const toPrompt = (text: string, images: Blob[]): LanguageModelPrompt =>
  images.length > 0
    ? [
        {
          content: [
            ...(text ? [{ type: "text" as const, value: text }] : []),
            ...images.map((value) => ({ type: "image" as const, value })),
          ],
          role: "user",
        },
      ]
    : text;

export const createSummarizer = async (
  signal: AbortSignal,
  onProgress: Progress
): Promise<Summarizer | undefined> =>
  "Summarizer" in window &&
  (await Summarizer.availability(SUMMARIZER_OPTIONS)) !== "unavailable"
    ? Summarizer.create({
        ...SUMMARIZER_OPTIONS,
        monitor: monitorProgress(onProgress),
        signal,
      })
    : undefined;

const fitToQuota = async (
  summarizer: Summarizer,
  text: string,
  signal: AbortSignal
): Promise<string> => {
  const usage = await summarizer.measureInputUsage(text, { signal });

  if (usage <= summarizer.inputQuota) return text;

  const chunkLength = Math.ceil(
    text.length / Math.ceil(usage / summarizer.inputQuota)
  );
  const summaries: string[] = [];

  for (let start = 0; start < text.length; start += chunkLength) {
    // eslint-disable-next-line no-await-in-loop
    const chunk = await fitToQuota(
      summarizer,
      text.slice(start, start + chunkLength),
      signal
    );

    // eslint-disable-next-line no-await-in-loop
    summaries.push(await summarizer.summarize(chunk, { signal }));
  }

  return fitToQuota(summarizer, summaries.join("\n"), signal);
};

export const summarize = async (
  summarizer: Summarizer,
  text: string,
  signal: AbortSignal,
  onText: TextUpdate
): Promise<string> =>
  readStream(
    summarizer.summarizeStreaming(await fitToQuota(summarizer, text, signal), {
      signal,
    }),
    onText
  );

export const summarizeWithSession = (
  session: LanguageModel,
  text: string,
  signal: AbortSignal,
  onText: TextUpdate
): Promise<string> =>
  readStream(
    session.promptStreaming(
      // ~2 characters per token leaves room in the context for the summary
      `Summarize the following text:\n\n${text.slice(
        0,
        (session.contextWindow - session.contextUsage) * 2
      )}`,
      { signal }
    ),
    onText
  );
