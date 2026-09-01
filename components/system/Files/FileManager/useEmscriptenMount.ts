import { useCallback, useEffect, useRef } from "react";
import { useFileSystemActions } from "contexts/fileSystem";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";

type EmscriptenMounter = (FS?: EmscriptenFS, fsName?: string) => Promise<void>;

const useEmscriptenMount = (): EmscriptenMounter => {
  const { mountEmscriptenFs, unMapFs, updateFolder } = useFileSystemActions();
  const mountName = useRef("");

  useEffect(
    () => () => {
      if (mountName.current) {
        const unMountPath = mountName.current;

        mountName.current = "";

        unMapFs(unMountPath, true)
          .then(() => updateFolder("/", undefined, unMountPath))
          .catch(() => {
            // Ignore error during unmounting
          });
      }
    },
    [unMapFs, updateFolder]
  );

  return useCallback(
    async (FS?: EmscriptenFS, fsName?: string): Promise<void> => {
      if (!FS) return;

      let name = "";

      try {
        name = await mountEmscriptenFs(FS, fsName);
      } catch {
        // Ignore error during mounting
      }

      if (name) {
        updateFolder("/", name);
        mountName.current = name;
      }
    },
    [mountEmscriptenFs, updateFolder]
  );
};

export default useEmscriptenMount;
