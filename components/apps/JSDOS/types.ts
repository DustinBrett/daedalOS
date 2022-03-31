import type { DosFactoryType } from "emulators-ui/dist/types/js-dos";

declare global {
  interface Window {
    Dos: DosFactoryType;
    SimpleKeyboardInstances?: {
      emulatorKeyboard?: {
        destroy: () => void;
      };
    };
    emulators: {
      pathPrefix: string;
    };
  }
}
