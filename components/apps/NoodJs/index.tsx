import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import useHistory from "hooks/useHistory";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "styles/common/Button";
import { label } from "utils/functions";

import StyledBrowser from "../Browser/StyledBrowser";
import { Refresh, Stop } from "./NavigationIcons";
import { config as iframeConfig } from "./iframeConfig";

const defaultRuntime = `{
  const terminal = document.createElement('pre');
  document.body.appendChild(terminal);
  const _console = { ...console };
  const createLogger = (type) => {
    if (!(type in console)) {
      throw new Error(\`Invalid console type: \${type}\`);
    }
    return (...args) => {
      _console[type](...args);
      terminal.innerText += \`\${type}: \${args.join()}\n\`;
    }
  }
  console.log = createLogger('log');
  console.warn = createLogger('warn');
  console.error = createLogger('error');
  console.info = createLogger('info');
  console.debug = createLogger('debug');
  console.dir = createLogger('dir');
}`

export const defaultRuntimeConfig = {
  libs: [] as string[],
  runtime: defaultRuntime,
  transformInputSource: (source: string) => source,
};

export type RuntimeConfig = typeof defaultRuntimeConfig;

interface NoodjsProps extends ComponentProcessProps {
  runtimeConfig?: typeof defaultRuntimeConfig;
  onMessage?: (message: any, returnMessage: any) => void;
}

const Browser: FC<NoodjsProps> = ({
  id,
  runtimeConfig = defaultRuntimeConfig,
  onMessage = () => {},
}) => {
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
        const isValid = (await exists(addressInput));
        setLoading(true);
        setSrcDoc("");
        if (isValid) {
          const fileSrc = (await readFile(addressInput)).toString();
          const srcToRun = runtimeConfig.transformInputSource(fileSrc);
          const runtimeSrc = runtimeConfig.runtime;
          const libsSrc = Array.prototype.map.call(runtimeConfig.libs, (libSrc) => {
            return `<script src="${libSrc}"></script>`
          })
          const wrapped = `
          <html>
            <head>${libsSrc}</head>
            <body></body>
            <script>${runtimeSrc}</script>
            <script>${srcToRun}</script>
          </html>`;
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

  // This hook is listening an event that came from the Iframe
  useEffect(() => {
    if (!iframeRef.current) return
    const handler = (event: MessageEvent<any>) => {
      const returnMessage = (message: any) => {
        iframeRef.current?.contentWindow?.postMessage(message, '*')
      }
      onMessage(event, returnMessage)
    }
    globalThis.addEventListener('message', handler)
    return () => globalThis.removeEventListener('message', handler)
  }, [iframeRef.current])

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
        {...iframeConfig}
      />
    </StyledBrowser>
  );
};

export default Browser;
