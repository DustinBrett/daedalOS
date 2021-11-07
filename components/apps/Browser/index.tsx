import { config, HOME_PAGE } from "components/apps/Browser/config";
import { Arrow, Refresh, Stop } from "components/apps/Browser/NavigationIcons";
import StyledBrowser from "components/apps/Browser/StyledBrowser";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import useHistory from "utils/useHistory";

const Browser = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    url: changeUrl,
    processes: { [id]: process },
  } = useProcesses();
  const { url = "" } = process || {};
  const initialUrl = url || HOME_PAGE;
  const { canGoBack, canGoForward, history, moveHistory, position } =
    useHistory(initialUrl, id);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(false);
  const changeHistory = (step: number): void => {
    moveHistory(step);

    if (inputRef.current) inputRef.current.value = history[position + step];
  };
  const setUrl = useCallback((newUrl: string): void => {
    const { contentWindow } = iframeRef.current || {};

    if (contentWindow?.location) {
      setLoading(true);
      contentWindow.location.replace(newUrl);
    }
  }, []);

  useEffect(() => {
    setUrl(history[position]);
  }, [history, position, setUrl]);

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
        title={id}
        {...config}
      />
    </StyledBrowser>
  );
};

export default Browser;
