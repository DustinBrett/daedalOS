import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import useHistory from "hooks/useHistory";
import { extname } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "styles/common/Button";
import { label } from "utils/functions";

import StyledBrowser from "../Browser/StyledBrowser";
import { Refresh, Stop } from "./NavigationIcons";
import { config } from "./config";

const Browser: FC<ComponentProcessProps> = ({ id }) => {
  const {
    icon: setIcon,
    processes: { [id]: process },
  } = useProcesses();
  const { url = "" } = process || {};
  const initialUrl = url;
  const { history, position } = useHistory(initialUrl, id);
  const { exists, readFile } = useFileSystem();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [srcDoc, setSrcDoc] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const setUrl = useCallback(
    async (addressInput: string): Promise<void> => {
      const { contentWindow } = iframeRef.current || {};

      if (contentWindow?.location) {
        const isNood =
          extname(addressInput).toLowerCase() === ".eval" &&
          (await exists(addressInput));

        setLoading(true);
        setSrcDoc("");
        if (isNood) {
          const fileSrc = (await readFile(addressInput)).toString();
          const runtimeSrc = `{
  const terminal = document.createElement('pre')
  document.body.appendChild(terminal)
  const _log = console.log
  console.log = log

  function log (message) {
    _log(message)
    terminal.innerText += \`\${message}\n\`
  }
}`;
          const wrapped = `<html><body></body><script>${runtimeSrc}</script><script>${fileSrc}</script></html>`;
          setSrcDoc(wrapped);
        }
        setIcon(id, processDirectory.Browser.icon);
      }
    },
    [exists, id, readFile, setIcon]
  );
  const style = useMemo<React.CSSProperties>(
    () => ({ backgroundColor: srcDoc ? "#fff" : "initial" }),
    [srcDoc]
  );

  useEffect(() => {
    if (process && history[position] !== currentUrl) {
      setUrl(history[position]);
      setCurrentUrl(history[position]);
    }
  }, [currentUrl, history, position, process, setUrl]);

  return (
    <StyledBrowser $hasSrcDoc={Boolean(srcDoc)}>
      <nav>
        <div>
          <Button
            disabled={loading}
            onClick={() => setUrl(history[position])}
            {...label("Reload this page")}
          >
            {loading ? <Stop /> : <Refresh />}
          </Button>
        </div>
      </nav>
      <iframe
        ref={iframeRef}
        onLoad={() => setLoading(false)}
        srcDoc={srcDoc || undefined}
        style={style}
        title={id}
        {...config}
      />
    </StyledBrowser>
  );
};

export default Browser;
