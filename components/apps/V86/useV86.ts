import {
  BOOT_CD_FD_HD,
  BOOT_FD_CD_HD,
  config,
  libs,
  saveExtension,
} from "components/apps/V86//config";
import type { V86ImageConfig } from "components/apps/V86/image";
import { getImageType } from "components/apps/V86/image";
import type { V86Config, V86Starter } from "components/apps/V86/types";
import useV86ScreenSize from "components/apps/V86/useV86ScreenSize";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { basename, extname, join } from "path";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER, SAVE_PATH } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl, loadFiles } from "utils/functions";

const useV86 = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>
): void => {
  const { appendFileToTitle } = useTitle(id);
  const [emulator, setEmulator] = useState<V86Starter>();
  const { fs, mkdirRecursive, updateFolder } = useFileSystem();

  useV86ScreenSize(id, containerRef, emulator);

  useEffect(() => {
    if (!emulator && fs && url) {
      fs.readFile(url, (_imageError, imageContents = EMPTY_BUFFER) => {
        loadFiles(libs).then(() => {
          const isISO = extname(url).toLowerCase() === ".iso";
          const bufferUrl = bufferToUrl(imageContents);
          const v86ImageConfig: V86ImageConfig = {
            [isISO ? "cdrom" : getImageType(imageContents.length)]: {
              async: false,
              size: imageContents.length,
              url: bufferUrl,
              use_parts: false,
            },
          };
          const v86StarterConfig: V86Config = {
            boot_order: isISO ? BOOT_CD_FD_HD : BOOT_FD_CD_HD,
            screen_container: containerRef.current,
            ...v86ImageConfig,
            ...config,
          };

          fs.readFile(
            join(SAVE_PATH, `${basename(url)}${saveExtension}`),
            (saveError, saveContents = EMPTY_BUFFER) => {
              if (!saveError) {
                v86StarterConfig.initial_state = {
                  url: bufferToUrl(saveContents),
                };
              }

              if (window.V86Starter) {
                const v86 = new window.V86Starter(v86StarterConfig);

                v86.add_listener("emulator-loaded", () => {
                  appendFileToTitle(url);
                  cleanUpBufferUrl(bufferUrl);
                  if (v86StarterConfig.initial_state) {
                    cleanUpBufferUrl(v86StarterConfig.initial_state.url);
                  }
                });

                containerRef.current?.addEventListener("click", v86.lock_mouse);

                setEmulator(v86);
              }
            }
          );
        });
      });
    }

    return () => {
      if (emulator && fs && url) {
        emulator.save_state((_error, newState) =>
          mkdirRecursive(SAVE_PATH, () => {
            const saveName = `${basename(url)}${saveExtension}`;

            fs.writeFile(
              join(SAVE_PATH, saveName),
              Buffer.from(new Uint8Array(newState)),
              () => {
                emulator.destroy();
                updateFolder(SAVE_PATH, saveName);
              }
            );
          })
        );
      }
    };
  }, [
    appendFileToTitle,
    containerRef,
    emulator,
    fs,
    mkdirRecursive,
    updateFolder,
    url,
  ]);
};

export default useV86;
