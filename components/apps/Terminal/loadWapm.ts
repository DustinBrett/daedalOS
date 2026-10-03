import { basename, extname } from "path";
import { type WASIBindings } from "wasi-js";
import {
  config,
  WAPM_STD_IN_APPS,
  WAPM_STD_IN_EXCLUDE_ARGS,
} from "components/apps/Terminal/config";
import {
  clearAnsiBackground,
  parseCommand,
} from "components/apps/Terminal/functions";
import { getExtension } from "utils/functions";

type WASIError = Error & {
  code: number;
};

let bindings: null | WASIBindings;

const WASM_MAGIC_NUMBER = [0x00, 0x61, 0x73, 0x6d];
const ATOM_MAGIC_NUMBER = [
  0x04, 0x25, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x61, 0x74, 0x6f, 0x6d,
];

const REGISTRY_URL = "https://registry.wapm.io/graphql";

type WapmGetPackageQueryResponse = {
  getPackage: {
    versions: {
      distribution: {
        piritaDownloadUrl: string;
      };
    }[];
  };
};

const createWapmGetPackageQuery = (command: string): string => `{
  getPackage(name: "${command}") {
    versions {
      distribution {
        piritaDownloadUrl
      }
    }
  }
}`;

type WapmCommandQuery = {
  operationName: string;
  query: string;
  variables: { command: string };
};

type WapmGetCommandQueryResponse = {
  command: {
    module: {
      publicUrl: string;
    };
  };
};

const createWapmGetCommandQuery = (command: string): WapmCommandQuery => ({
  operationName: "shellGetCommandQuery",
  query: `
    query shellGetCommandQuery($command: String!) {
      command: getCommand(name: $command) {
        module {
          publicUrl
        }
      }
    }
  `,
  variables: { command },
});

const findMagicNumberIndex = (
  buffer: Uint8Array,
  magicNumber: Uint8Array,
  last = false
): number => {
  const bufferArray = [...buffer];
  const magicNumberArray = [...magicNumber];
  const arrays = bufferArray.map((_, i) =>
    bufferArray.slice(i, i + magicNumberArray.length)
  );
  const checkArray = (array: number[]): boolean =>
    array.length === magicNumberArray.length &&
    array.every((number, index) => number === magicNumberArray[index]);
  const foundIndex = last
    ? arrays.findLastIndex((array) => checkArray(array))
    : arrays.findIndex((array) => checkArray(array));

  return foundIndex === -1 ? (last ? buffer.length : 0) : foundIndex;
};

const fetchCommandFromWAPM = async ({
  args: [command],
}: {
  args: string[];
}): Promise<Uint8Array> => {
  let url = "";

  try {
    const packageResponse = (await (
      await fetch(REGISTRY_URL, {
        body: JSON.stringify({ query: createWapmGetPackageQuery(command) }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    ).json()) as {
      data: WapmGetPackageQueryResponse;
    };

    url =
      packageResponse?.data?.getPackage?.versions[0]?.distribution
        ?.piritaDownloadUrl;

    if (!url) {
      const commandResponse = (await (
        await fetch(REGISTRY_URL, {
          body: JSON.stringify(createWapmGetCommandQuery(command)),
          headers: { "content-type": "application/json" },
          method: "POST",
        })
      ).json()) as {
        data: WapmGetCommandQueryResponse;
      };

      url = commandResponse?.data?.command?.module?.publicUrl;
    }
  } catch {
    // Ignore failure to fetch from WAPM Registry
  }

  let wasmBinary = new Uint8Array();

  if (!url) return wasmBinary;

  try {
    wasmBinary = new Uint8Array(await (await fetch(url)).arrayBuffer());
  } catch {
    // Ignore failure to fetch from WAPM Repository
  }

  if (wasmBinary.length === 0) return new Uint8Array();

  return wasmBinary.subarray(
    findMagicNumberIndex(wasmBinary, new Uint8Array(WASM_MAGIC_NUMBER)),
    findMagicNumberIndex(wasmBinary, new Uint8Array(ATOM_MAGIC_NUMBER), true)
  );
};

const loadWapm = async (
  commandArgs: string[],
  print: (message: string) => void,
  printLn: (message: string) => void,
  wasmFile?: Buffer,
  pipedCommand?: string
): Promise<[] | [string, Buffer | Uint8Array]> => {
  const args = commandArgs[0] === "run" ? commandArgs.slice(1) : commandArgs;
  const [{ lowerI64Imports }, { default: WASI }] = await Promise.all([
    import("@wasmer/wasm-transformer"),
    import("wasi-js"),
  ]);

  try {
    const wasmBinary = wasmFile || (await fetchCommandFromWAPM({ args }));

    if (
      wasmBinary.length === 0 ||
      (wasmBinary.length < 1024 &&
        new TextDecoder().decode(wasmBinary).includes("NoSuchKey"))
    ) {
      throw new Error(`command not found ${args[0]}`);
    }

    const moduleResponse = await lowerI64Imports(wasmBinary);

    if (
      typeof moduleResponse === "object" &&
      moduleResponse instanceof Uint8Array
    ) {
      bindings ||= (await import("wasi-js/dist/bindings/browser")).default;

      const wasmModule = await WebAssembly.compile(
        moduleResponse as BufferSource
      );
      const stdIn =
        (WAPM_STD_IN_APPS.includes(args[0]) ||
          (getExtension(args[0]) === ".wasm" &&
            WAPM_STD_IN_APPS.includes(basename(args[0], extname(args[0]))))) &&
        (typeof args[2] === "string" ||
          !WAPM_STD_IN_EXCLUDE_ARGS.includes(args[1]));
      let readStdIn = false;
      const wasiArgs = stdIn
        ? pipedCommand
          ? parseCommand(pipedCommand).slice(1)
          : []
        : args;
      const wasi = new WASI({
        args: wasiArgs,
        bindings,
        env: {
          COLUMNS: config.cols?.toString(),
          LINES: config.rows?.toString(),
        },
        ...(stdIn
          ? {
              getStdin: () => {
                // An empty read is the EOF
                const input = readStdIn
                  ? ""
                  : args.slice(wasiArgs.length).join(" ");

                readStdIn = true;

                return Buffer.from(input, "utf8");
              },
            }
          : {}),
        sendStderr: (buffer: Uint8Array) => print(buffer.toString()),
        sendStdout: (buffer: Uint8Array) => {
          const output = buffer.toString();
          print(stdIn ? clearAnsiBackground(output) : output);
        },
      });
      const instance = await WebAssembly.instantiate(
        wasmModule,
        wasi.getImports(wasmModule)
      );

      try {
        wasi.start(instance);
      } catch {
        // Ignore error while running command
      }

      if (!wasmFile) return [args[0].split("/").slice(-1)[0], wasmBinary];
    }
  } catch (error) {
    const { code, message } = error as WASIError;

    if (code !== 0 && !/^WASI Exit error: \d$/.test(message)) printLn(message);
  }

  return [];
};

export default loadWapm;
