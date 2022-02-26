import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useProcesses } from "contexts/process";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import type { DefaultTheme, StyledComponent } from "styled-components";

const StyledLoading = dynamic(
  () => import("components/system/Files/FileManager/StyledLoading")
);

type ContainerHook = (
  id: string,
  url: string,
  container: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
) => void;

const AppContainer = (
  id: string,
  useHook: ContainerHook,
  Component: StyledComponent<"div", DefaultTheme>,
  children?: React.ReactNode,
  siblings?: React.ReactNode
): JSX.Element => {
  const {
    processes: { [id]: { url: currentUrl = "" } = {} },
  } = useProcesses();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const style = useMemo<React.CSSProperties>(
    () => ({
      contain: "strict",
      visibility: loading ? "hidden" : "visible",
    }),
    [loading]
  );

  useHook(id, currentUrl, containerRef, setLoading, loading);

  return (
    <>
      {loading && <StyledLoading />}
      <Component ref={containerRef} style={style} {...useFileDrop({ id })}>
        {children}
      </Component>
      {siblings}
    </>
  );
};

export default AppContainer;
