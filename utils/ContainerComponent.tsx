import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { join } from "path";
import { useRef } from "react";
import type { DefaultTheme, StyledComponent } from "styled-components";
import { TEMP_PATH } from "utils/constants";

type ContainerHook = (
  id: string,
  url: string,
  container: React.MutableRefObject<HTMLDivElement | null>
) => void;

const ContainerComponent = (
  id: string,
  useHook: ContainerHook,
  Component: StyledComponent<"div", DefaultTheme>,
  children?: JSX.Element
): JSX.Element => {
  const {
    url,
    processes: { [id]: { url: currentUrl = "" } = {} },
  } = useProcesses();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { fs, mkdirRecursive } = useFileSystem();
  const fileDrop = useFileDrop((filePath: string, fileData?: Buffer) => {
    if (!fileData) {
      url(id, filePath);
    } else {
      const tempPath = join(TEMP_PATH, filePath);

      mkdirRecursive(TEMP_PATH, () => {
        fs?.writeFile(tempPath, fileData, (error) => {
          if (!error) url(id, tempPath);
        });
      });
    }
  });

  useHook(id, currentUrl, containerRef);

  return (
    <Component ref={containerRef} {...fileDrop}>
      {children}
    </Component>
  );
};

export default ContainerComponent;
