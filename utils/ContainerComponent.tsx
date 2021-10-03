import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useProcesses } from "contexts/process";
import { useRef } from "react";
import type { DefaultTheme, StyledComponent } from "styled-components";

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
    processes: { [id]: { url: currentUrl = "" } = {} },
  } = useProcesses();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useHook(id, currentUrl, containerRef);

  return (
    <Component ref={containerRef} {...useFileDrop({ id })}>
      {children}
    </Component>
  );
};

export default ContainerComponent;
