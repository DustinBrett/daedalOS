import { memo, useMemo, useRef, useState } from "react";
import { type IStyledComponent } from "styled-components";
import { type FastOmit } from "styled-components/dist/types";
import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useProcesses } from "contexts/process";

export type ContainerHookProps = {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  id: string;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  url: string;
};

type ContainerHook = (props: ContainerHookProps) => void;

type AppContainerProps = {
  StyledComponent: IStyledComponent<
    "web",
    FastOmit<
      React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      >,
      never
    >
  >;
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
