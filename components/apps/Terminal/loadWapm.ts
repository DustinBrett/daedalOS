import { config } from "components/apps/Terminal/config";
import type { LocalEcho } from "components/apps/Terminal/types";

type WASIError = Error & {
  code: number;
};

const loadWapm = async (
  commandArgs: string[],
  localEcho: LocalEcho
): Promise<void> => {
  const { fetchCommandFromWAPM } = await import("@wasmer/wasm-terminal");
  const { lowerI64Imports } = await import("@wasmer/wasm-transformer");
  const { WASI } = await import("@wasmer/wasi");
  const { WasmFs } = await import("@wasmer/wasmfs");

  try {
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
        localEcho?.print(output);
      }
    }
  } catch (error) {
    const { message } = error as WASIError;

    localEcho?.println(message);
  }
};

export default loadWapm;
