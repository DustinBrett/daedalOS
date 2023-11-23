import { type DosFactoryType } from "emulators-ui/dist/types/js-dos";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";

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
