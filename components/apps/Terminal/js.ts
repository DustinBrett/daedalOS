import { type QuickJSContext } from "quickjs-emscripten";

type Output = string | number | object;

const addConsole = (
  vm: QuickJSContext,
  printOutput: (output: Output) => void
): void => {
  const logHandle = vm.newFunction("log", (...args) =>
    // eslint-disable-next-line unicorn/no-array-callback-reference, @typescript-eslint/unbound-method
    args.map(vm.dump).forEach(printOutput)
  );
  const consoleHandle = vm.newObject();

  vm.setProp(consoleHandle, "error", logHandle);
  vm.setProp(consoleHandle, "log", logHandle);
  vm.setProp(consoleHandle, "warn", logHandle);
  vm.setProp(vm.global, "console", consoleHandle);

  consoleHandle.dispose();
  logHandle.dispose();
};

const addWindow = (vm: QuickJSContext): void => {
  vm.setProp(vm.global, "window", vm.global);
};

export const runJs = async (
  code: string,
  printLn: (message: string) => void
): Promise<void> => {
  const { getQuickJS } = await import("quickjs-emscripten");
  const vm = (await getQuickJS()).newContext();
  const printOutput = (output: Output): void => {
    if (typeof output === "string" || typeof output === "number") {
      printLn(output.toString());
    } else if (typeof output === "object") {
      printLn(JSON.stringify(output));
    }
  };

  if (!code) return;

  addConsole(vm, printOutput);
  addWindow(vm);

  const result = vm.evalCode(code);

  if (result.error) {
    const { message, name, stack } = vm.dump(result.error) as Error;

    printOutput(`${name}: ${message}\n${stack}`);
    result.error.dispose();
  } else {
    printOutput(vm.dump(result.value) as Output);
    result.value.dispose();
  }
};
