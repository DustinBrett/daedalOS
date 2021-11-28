import { config, HOME_PAGE } from "components/apps/Browser/config";
import { Arrow, Refresh, Stop } from "components/apps/Browser/NavigationIcons";
import StyledBrowser from "components/apps/Browser/StyledBrowser";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { extname } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";
import { isValidUrl } from "utils/functions";
import useHistory from "utils/useHistory";

const Browser = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    icon: setIcon,
    url: changeUrl,
    processes: { [id]: process },
  } = useProcesses();
  const { url = "" } = process || {};
  const initialUrl = url || HOME_PAGE;
  const { canGoBack, canGoForward, history, moveHistory, position } =
    useHistory(initialUrl, id);
  const { exists, readFile } = useFileSystem();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [srcDoc, setSrcDoc] = useState("");
  const changeHistory = (step: number): void => {
    moveHistory(step);

    if (inputRef.current) inputRef.current.value = history[position + step];
  };
  const [currentUrl, setCurrentUrl] = useState("");
  const setUrl = useCallback(
    async (addressInput: string): Promise<void> => {
      const { contentWindow } = iframeRef.current || {};

      if (contentWindow?.location) {
        const isHtml =
          extname(addressInput) === ".html" && (await exists(addressInput));

        setLoading(true);
        setSrcDoc("");
        if (isHtml) setSrcDoc((await readFile(addressInput)).toString());
        setIcon(id, processDirectory["Browser"].icon);

        if (!isHtml) {
          const addressUrl = isValidUrl(addressInput)
            ? addressInput
            : `https://www.google.com/search?igu=1&q=${addressInput}`;

          contentWindow.location.replace(addressUrl);

          const favicon = new Image();
          const faviconUrl = `${new URL(addressUrl).origin}/favicon.ico`;

          favicon.addEventListener(
            "load",
            () => setIcon(id, faviconUrl),
            ONE_TIME_PASSIVE_EVENT
          );
          favicon.src = faviconUrl;
        }
      }
    },
    [exists, id, readFile, setIcon]
  );

  useEffect(() => {
    if (process && history[position] !== currentUrl) {
      setUrl(history[position]);
      setCurrentUrl(history[position]);
    }
  }, [currentUrl, history, position, process, setUrl]);

  return (
    <StyledBrowser>
      <nav>
        <div>
          <Button
            disabled={!canGoBack}
            onClick={() => changeHistory(-1)}
            title="Click to go back"
          >
            <Arrow direction="left" />
          </Button>
          <Button
            disabled={!canGoForward}
            onClick={() => changeHistory(+1)}
            title="Click to go forward"
          >
            <Arrow direction="right" />
          </Button>
          <Button
            disabled={loading}
            onClick={() => setUrl(history[position])}
            title="Reload this page"
          >
            {loading ? <Stop /> : <Refresh />}
          </Button>
        </div>
        <input
          ref={inputRef}
          defaultValue={initialUrl}
          onFocus={() => inputRef.current?.select()}
          onKeyDown={async ({ code }) => {
            if (inputRef.current && code === "Enter") {
              changeUrl(id, inputRef.current.value);
              window.getSelection()?.removeAllRanges();
            }
          }}
          type="text"
        />
      </nav>
      <iframe
        ref={iframeRef}
        onLoad={() => setLoading(false)}
        srcDoc={srcDoc || undefined}
        style={{ backgroundColor: srcDoc ? "#fff" : "initial" }}
        title={id}
        {...config}
      />
    </StyledBrowser>
  );
};

export default Browser;
