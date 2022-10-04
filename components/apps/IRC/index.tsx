import { getNetworkConfig } from "components/apps/IRC/config";
import StyledIRC from "components/apps/IRC/StyledIRC";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import { useProcesses } from "contexts/process";
import { useEffect, useRef, useState } from "react";

const IRC: FC<ComponentProcessProps> = ({ id }) => {
  const { processes: { [id]: { libs: [ircSrc = ""] = [] } = {} } = {} } =
    useProcesses();
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!window.localStorage.getItem("kiwiirc")) {
      window.localStorage.setItem(
        "kiwiirc",
        JSON.stringify(getNetworkConfig("Guest"))
      );
    }
  }, []);

  useEffect(() => {
    if (loaded && iframeRef.current?.contentWindow) {
      (
        [
          ...iframeRef.current.contentWindow.document.querySelectorAll(
            ".kiwi-network-name-option-collapse"
          ),
        ] as HTMLDivElement[]
      ).forEach(
        (networkEntryCollapse, index) =>
          index !== 0 && networkEntryCollapse?.click()
      );
    }
  }, [loaded]);

  return (
    <StyledIRC>
      {!loaded && <StyledLoading />}
      <iframe
        ref={iframeRef}
        height="100%"
        onLoad={() => setLoaded(true)}
        src={ircSrc}
        title={id}
        width="100%"
      />
    </StyledIRC>
  );
};

export default IRC;
