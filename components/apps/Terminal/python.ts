import { loadFiles } from "utils/functions";
import type { Terminal } from "xterm";

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
  terminal: Terminal
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
      terminal?.write(
        `\r\n${result
          .toString()
          .replace(/[\n\r]+/g, "\n")
          .replace(/\n/g, "\r\n")}`
      );
    }
  }

  terminal?.writeln("");
};
