import { useRef, useState } from "react";
import styled, { type IStyledComponent } from "styled-components";
import { type FastOmit } from "styled-components/dist/types";
import StyledLoading from "components/system/Apps/StyledLoading";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useProcess } from "contexts/process";

export type ContainerHookProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  id: string;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  url: string;
};

type AppContainerProps = ContainerHookProps & {
  StyledComponent?: IStyledComponent<
    "web",
    FastOmit<
      React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      >,
      never
    >
  >;
};

const StyledAppContainer = styled.div``;

export const useAppContainer = (id: string): ContainerHookProps => {
  const { url = "" } = useProcess(id);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  return { containerRef, id, loading, setLoading, url };
};

const AppContainer: FC<AppContainerProps> = ({
  children,
  containerRef,
  id,
  loading,
  StyledComponent,
}) => {
  const style: React.CSSProperties = {
    contain: "strict",
    visibility: loading ? "hidden" : "visible",
  };
  const StyledWrapper = StyledComponent || StyledAppContainer;

  return (
    <>
      {loading && <StyledLoading />}
      <StyledWrapper
        ref={containerRef}
        aria-busy={loading || undefined}
        style={style}
        {...useFileDrop({ id })}
      >
        {children}
      </StyledWrapper>
    </>
  );
};

export default AppContainer;
