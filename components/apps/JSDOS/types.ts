import type { EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
import type { DosFactoryType } from "emulators-ui/dist/types/js-dos";

declare global {
  interface Window {
    Dos: DosFactoryType;
    JSDOS_FS: EmscriptenFS;
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
