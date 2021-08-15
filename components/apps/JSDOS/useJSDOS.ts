import type { FSModule } from "browserfs/dist/node/core/FS";
import {
  defaultConfig,
  dosOptions,
  globals,
  libs,
  pathPrefix,
  zipConfigPath,
} from "components/apps/JSDOS/config";
import { addFileToZip, isFileInZip } from "components/apps/JSDOS/zipFunctions";
import { closeWithTransition } from "components/system/Window/functions";
import useTitle from "components/system/Window/useTitle";
import useWindowSize from "components/system/Window/useWindowSize";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import type { CommandInterface } from "emulators";
import type { DosInstance } from "emulators-ui/dist/types/js-dos";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl, loadFiles } from "utils/functions";

const addJsDosConfig = async (buffer: Buffer, fs: FSModule): Promise<Buffer> =>
  (await isFileInZip(buffer, zipConfigPath))
    ? buffer
    : addFileToZip(buffer, defaultConfig, zipConfigPath, fs);

const cleanUpLoader = (): void =>
  globals.forEach((global) => delete (window as never)[global]);

const useJSDOS = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>
): void => {
  const { appendFileToTitle } = useTitle(id);
  const { updateWindowSize } = useWindowSize(id);
  const [dosCI, setDosCI] = useState<CommandInterface>();
  const [dosInstance, setDosInstance] = useState<DosInstance>();
  const { fs } = useFileSystem();
  const { close, linkElement } = useProcesses();

  useEffect(() => {
    if (!dosInstance && containerRef.current) {
      loadFiles(libs).then(() => {
        window.emulators.pathPrefix = pathPrefix;

        setDosInstance(
          window.Dos(containerRef.current as HTMLDivElement, dosOptions)
        );
      });
    }
  }, [containerRef, dosInstance]);

  useEffect(() => {
    if (dosInstance && fs && url) {
      fs.readFile(url, async (_error, contents = EMPTY_BUFFER) => {
        const objectURL = bufferToUrl(await addJsDosConfig(contents, fs));

        dosInstance.run(objectURL).then((ci) => {
          const canvas = containerRef.current?.querySelector("canvas");

          linkElement(id, "peekElement", canvas as HTMLCanvasElement);
          setDosCI(ci);
          appendFileToTitle(url);
          cleanUpBufferUrl(objectURL);
          cleanUpLoader();
        });
      });
    }

    return () => {
      dosInstance?.stop?.();
    };
  }, [appendFileToTitle, containerRef, dosInstance, fs, id, linkElement, url]);

  useEffect(() => {
    if (dosCI) {
      updateWindowSize(dosCI.height(), dosCI.width());

      dosCI.events().onMessage((_msgType, _eventType, command, message) => {
        if (command === "LOG_EXEC") {
          const [dosCommand] = message
            .replace("Parsing command line: ", "")
            .split(" ");

          if (dosCommand.toUpperCase() === "EXIT") {
            closeWithTransition(close, id);
          }
        }
      });

      dosCI
        .events()
        .onFrameSize((width, height) =>
          updateWindowSize(height * 2, width * 2)
        );

      dosCI
        .events()
        .onExit(() =>
          window.SimpleKeyboardInstances?.emulatorKeyboard?.destroy?.()
        );
    }
  }, [close, dosCI, id, updateWindowSize]);
};

export default useJSDOS;
