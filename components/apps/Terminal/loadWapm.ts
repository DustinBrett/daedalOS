import { config } from "components/apps/Terminal/config";
import type { LocalEcho } from "components/apps/Terminal/types";
import type { WASI as IWASI } from "node_modules/@wasmer/wasi/dist/pkg/wasmer_wasi_js";

type WASIError = Error & {
  code: number;
};

interface IWasmerWasi {
  WASI: typeof IWASI;
  init: () => Promise<WebAssembly.Exports>;
}

const loadWapm = async (
  commandArgs: string[],
  localEcho: LocalEcho
): Promise<void> => {
  const { fetchCommandFromWAPM } = await import("@wasmer/wasm-terminal");
  const { lowerI64Imports } = await import("@wasmer/wasm-transformer");
  const { init, WASI } = (await import("@wasmer/wasi")) as IWasmerWasi;

  try {
    await init();

    const wasmBinary = await fetchCommandFromWAPM({ args: commandArgs });

    if (
      wasmBinary.length < 1024 &&
      new TextDecoder().decode(wasmBinary).includes("NoSuchKey")
    ) {
      throw new Error(`command not found ${commandArgs[0]}`);
    }

    const moduleResponse = await lowerI64Imports(wasmBinary);

    if (moduleResponse !== undefined && moduleResponse instanceof Uint8Array) {
      const wasmModule = await WebAssembly.compile(moduleResponse);
      const wasi = new WASI({
        args: commandArgs,
        env: {
          COLUMNS: config.cols?.toString(),
          LINES: config.rows?.toString(),
        },
      });
      const instance = await WebAssembly.instantiate(
        wasmModule,
        wasi.getImports(wasmModule) as WebAssembly.Imports
      );

      wasi.start(instance);
      localEcho?.print(wasi.getStdoutString());
    }
  } catch (error) {
    const { message } = error as WASIError;

    localEcho?.println(message);
  }
};

export default loadWapm;
