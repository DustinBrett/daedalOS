import dynamic from "next/dynamic";
import { memo, useMemo, useRef, useState } from "react";
import { type styled } from "styled-components";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useProcesses } from "contexts/process";

const StyledLoading = dynamic(
  () => import("components/system/Files/FileManager/StyledLoading")
);

export type ContainerHookProps = {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  id: string;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  url: string;
};

type ContainerHook = (props: ContainerHookProps) => void;

type AppContainerProps = {
  StyledComponent: ReturnType<typeof styled.div>;
  id: string;
  useHook: ContainerHook;
};

const AppContainer: FC<AppContainerProps> = ({
  id,
  useHook,
  StyledComponent,
  children,
}): React.JSX.Element => {
  const {
    processes: { [id]: { url = "" } = {} },
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

  useHook({ containerRef, id, loading, setLoading, url });

  return (
    <>
      {loading && <StyledLoading />}
      <StyledComponent
        ref={containerRef}
        style={style}
        {...useFileDrop({ id })}
      >
        {children}
      </StyledComponent>
    </>
  );
};

export default memo(AppContainer);
