export const formatWebLlmProgress = (text: string): string => {
  if (text === "Start to fetch params") return "Fetching parameters";
  if (text.startsWith("Finish loading on WebGPU")) return "";

  const [, progressCurrent, progressTotal] =
    /\[(\d+)\/(\d+)\]/.exec(text) || [];

  let progress = "";

  if (!Number.isNaN(Number(progressTotal))) {
    progress = `${progressCurrent || 0}/${progressTotal}`;
  }

  if (text.startsWith("Loading model from cache")) {
    return `Loading${progress ? ` (${progress})` : ""}`;
  }

  const [, percentComplete] = /(\d+)% completed/.exec(text) || [];
  const [, secsElapsed] = /(\d+) secs elapsed/.exec(text) || [];

  if (!Number.isNaN(Number(percentComplete))) {
    progress += `${progress ? ", " : ""}${percentComplete}%`;
  }

  if (!Number.isNaN(Number(secsElapsed))) {
    progress += `${progress ? ", " : ""}${secsElapsed}s`;
  }

  if (text.startsWith("Loading GPU shader modules")) {
    return `Loading into GPU${progress ? ` (${progress})` : ""}`;
  }

  const [, dataLoaded] = /(\d+)MB (fetched|loaded)/.exec(text) || [];

  if (!Number.isNaN(Number(dataLoaded))) {
    progress += `${progress ? ", " : ""}${dataLoaded}MB`;
  }

  if (text.startsWith("Fetching param cache")) {
    return `Fetching${progress ? ` (${progress})` : ""}`;
  }

  return text;
};

export const speakMessage = (text: string): void => {
  const [voice] = window.speechSynthesis.getVoices();
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.voice = voice;
  utterance.pitch = 0.9;
  utterance.rate = 1.5;
  utterance.volume = 0.5;

  window.speechSynthesis.speak(utterance);
};
