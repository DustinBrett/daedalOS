import type { FSModule } from "browserfs/dist/node/core/FS";
import {
  defaultConfig,
  globals,
  saveExtension,
  zipConfigPath,
} from "components/apps/JSDOS/config";
import { addFileToZip, isFileInZip } from "components/apps/JSDOS/zipFunctions";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import type { CommandInterface } from "emulators";
import type { DosInstance } from "emulators-ui/dist/types/js-dos";
import { basename, join } from "path";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER, SAVE_PATH } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";

const addJsDosConfig = async (buffer: Buffer, fs: FSModule): Promise<Buffer> =>
  (await isFileInZip(buffer, zipConfigPath))
    ? buffer
    : addFileToZip(buffer, defaultConfig, zipConfigPath, fs);

const cleanUpLoader = (): void =>
  globals.forEach((global) => delete (window as never)[global]);

const useDosCI = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  dosInstance?: DosInstance
): CommandInterface | undefined => {
  const { appendFileToTitle } = useTitle(id);
  const { fs } = useFileSystem();
  const { linkElement } = useProcesses();
  const [dosCI, setDosCI] = useState<CommandInterface>();
  const { updateFolder } = useSession();

  useEffect(() => {
    if (dosInstance && !dosCI && fs && url) {
      fs.readFile(url, async (_urlError, urlContents = EMPTY_BUFFER) => {
        const bundleURL = bufferToUrl(await addJsDosConfig(urlContents, fs));

        fs.readFile(
          join(SAVE_PATH, `${basename(url)}${saveExtension}`),
          (saveError, saveContents = EMPTY_BUFFER) => {
            let optionalChangesUrl = "";

            if (!saveError) {
              optionalChangesUrl = bufferToUrl(saveContents);
            }

            // NOTE: js-dos v7 appends `?dt=` (Removed in lib, for now...)
            dosInstance.run(bundleURL, optionalChangesUrl).then((ci) => {
              const canvas = containerRef.current?.querySelector("canvas");

              linkElement(id, "peekElement", canvas as HTMLCanvasElement);
              setDosCI(ci);
              appendFileToTitle(url);
              cleanUpBufferUrl(bundleURL);
              if (optionalChangesUrl) cleanUpBufferUrl(optionalChangesUrl);
              cleanUpLoader();
            });
          }
        );
      });
    }

    return () => {
      if (dosCI && fs && url) {
        dosCI.persist().then((saveZip) => {
          fs.mkdir(SAVE_PATH, () =>
            fs.writeFile(
              join(SAVE_PATH, `${basename(url)}${saveExtension}`),
              Buffer.from(saveZip),
              () => {
                dosInstance?.stop();
                updateFolder(SAVE_PATH);
              }
            )
          );
        });
      }
    };
  }, [
    appendFileToTitle,
    containerRef,
    dosCI,
    dosInstance,
    fs,
    id,
    linkElement,
    updateFolder,
    url,
  ]);

  return dosCI;
};

export default useDosCI;
