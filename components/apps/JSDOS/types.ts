import { type DosFactoryType } from "emulators-ui/dist/types/js-dos";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";

declare global {
  interface Window {
    Dos: DosFactoryType;
    emulators: {
      pathPrefix: string;
    };
    JSDOS_FS: EmscriptenFS;
    SimpleKeyboardInstances?: {
      emulatorKeyboard?: {
        destroy: () => void;
      };
    };
  }
}

export type {
  DosOptions,
  EmulatorFunction,
} from "emulators-ui/dist/types/js-dos";
