import type { LocalEcho } from "components/apps/Terminal/types";
import { loadFiles } from "utils/functions";

type Pyodide = {
  runPythonAsync: (code: string) => Promise<string>;
};

declare global {
  interface Window {
    loadPyodide: (cfg: { indexURL: string }) => Promise<Pyodide>;
    pyodide?: Pyodide;
  }
}

const config = {
  indexURL: "/Program Files/Pyodide/",
};

const versionCommand = `
  import sys
  sys.version
`;

export const runPython = async (
  code: string,
  localEcho: LocalEcho
): Promise<void> => {
  await loadFiles(["/Program Files/Pyodide/pyodide.js"]);

  if (!window.pyodide && window.loadPyodide) {
    window.pyodide = await window.loadPyodide(config);
  }

  if (window.pyodide) {
    const getVersion = code === "ver" || code === "version";
    const result = await window.pyodide.runPythonAsync(
      getVersion ? versionCommand : code
    );

    if (typeof result !== "undefined") {
      localEcho?.println(result.toString());
    }
  }
};
