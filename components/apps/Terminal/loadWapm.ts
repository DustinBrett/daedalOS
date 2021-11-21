import { config } from "components/apps/Terminal/config";
import type { Terminal } from "xterm";

type WASIError = Error & {
  code: number;
};

const loadWapm = async (
  commandArgs: string[],
  terminal?: Terminal
): Promise<void> => {
  const { fetchCommandFromWAPM } = await import("@wasmer/wasm-terminal");
  const { lowerI64Imports } = await import("@wasmer/wasm-transformer");
  const { WASI } = await import("@wasmer/wasi");
  const { WasmFs } = await import("@wasmer/wasmfs");

  terminal?.writeln("");

  try {
    const wasmBinary = await fetchCommandFromWAPM({ args: commandArgs });
    const moduleResponse = await lowerI64Imports(wasmBinary);

    if (moduleResponse !== undefined && moduleResponse instanceof Uint8Array) {
      const wasmModule = await WebAssembly.compile(moduleResponse);
      const wasmFs = new WasmFs();
      const wasi = new WASI({
        args: commandArgs,
        bindings: {
          ...WASI.defaultBindings,
          fs: wasmFs.fs,
        },
        env: {
          COLUMNS: config.cols as unknown as string,
          LINES: config.rows as unknown as string,
        },
      });
      const instance = await WebAssembly.instantiate(
        wasmModule,
        wasi.getImports(wasmModule)
      );

      wasi.start(instance);

      const output = await wasmFs.getStdOut();

      if (typeof output === "string") {
        terminal?.write(
          output.replace(/[\n\r]+/g, "\n").replace(/\n/g, "\r\n")
        );
      }
    }
  } catch (error) {
    const { code, message } = error as WASIError;

    if (code) terminal?.writeln(message);
    else if (message.startsWith("command not found")) {
      terminal?.writeln(`WAPM: ${message}`);
    }
  }
};

export default loadWapm;
