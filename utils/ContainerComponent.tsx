import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useProcesses } from "contexts/process";
import { useRef, useState } from "react";
import type { DefaultTheme, StyledComponent } from "styled-components";

type ContainerHook = (
  id: string,
  url: string,
  container: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
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
  const [loading, setLoading] = useState(true);

  useHook(id, currentUrl, containerRef, setLoading, loading);

  return (
    <>
      {loading && <StyledLoading />}
      <Component
        ref={containerRef}
        style={{ visibility: loading ? "hidden" : "visible" }}
        {...useFileDrop({ id })}
      >
        {children}
      </Component>
    </>
  );
};

export default ContainerComponent;
