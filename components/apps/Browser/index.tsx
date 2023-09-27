import { Arrow, Refresh, Stop } from "components/apps/Browser/NavigationIcons";
import StyledBrowser from "components/apps/Browser/StyledBrowser";
import { HOME_PAGE, bookmarks } from "components/apps/Browser/config";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import useHistory from "hooks/useHistory";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  FAVICON_BASE_PATH,
  IFRAME_CONFIG,
  ONE_TIME_PASSIVE_EVENT,
} from "utils/constants";
import {
  GOOGLE_SEARCH_QUERY,
  getExtension,
  getUrlOrSearch,
  label,
} from "utils/functions";

const Browser: FC<ComponentProcessProps> = ({ id }) => {
  const {
    icon: setIcon,
    linkElement,
    url: changeUrl,
    processes: { [id]: process },
  } = useProcesses();
  const { prependFileToTitle } = useTitle(id);
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
  const currentUrl = useRef("");
  const setUrl = useCallback(
    async (addressInput: string): Promise<void> => {
      const { contentWindow } = iframeRef.current || {};

      if (contentWindow?.location) {
        const isHtml =
          [".htm", ".html"].includes(getExtension(addressInput)) &&
          (await exists(addressInput));

        setLoading(true);
        setSrcDoc("");
        if (isHtml) setSrcDoc((await readFile(addressInput)).toString());
        setIcon(id, processDirectory.Browser.icon);

        if (!isHtml) {
          const addressUrl = await getUrlOrSearch(addressInput);

          contentWindow.location.replace(addressUrl);

          if (addressUrl.startsWith(GOOGLE_SEARCH_QUERY)) {
            prependFileToTitle(`${addressInput} - Google Search`);
          } else {
            const { name = "" } =
              bookmarks?.find(
                ({ url: bookmarkUrl }) => bookmarkUrl === addressInput
              ) || {};

            prependFileToTitle(name);
          }

          if (addressInput.startsWith("ipfs://")) {
            setIcon(id, "/System/Icons/Favicons/ipfs.webp");
          } else {
            const favicon = new Image();
            const faviconUrl = `${
              new URL(addressUrl).origin
            }${FAVICON_BASE_PATH}`;

            favicon.addEventListener(
              "error",
              () => {
                const { icon } =
                  bookmarks?.find(
                    ({ url: bookmarkUrl }) => bookmarkUrl === addressUrl
                  ) || {};

                if (icon) setIcon(id, icon);
              },
              ONE_TIME_PASSIVE_EVENT
            );
            favicon.addEventListener(
              "load",
              () => setIcon(id, faviconUrl),
              ONE_TIME_PASSIVE_EVENT
            );
            favicon.src = faviconUrl;
          }
        }
      }
    },
    [exists, id, prependFileToTitle, readFile, setIcon]
  );

  useEffect(() => {
    if (process && history[position] !== currentUrl.current) {
      currentUrl.current = history[position];
      setUrl(history[position]);
    }
  }, [history, position, process, setUrl]);

  useEffect(() => {
    if (iframeRef?.current) {
      linkElement(id, "peekElement", iframeRef.current);
    }
  }, [id, linkElement]);

  return (
    <StyledBrowser $hasSrcDoc={Boolean(srcDoc)}>
      <nav>
        <div>
          <Button
            disabled={!canGoBack}
            onClick={() => changeHistory(-1)}
            {...label("Click to go back")}
          >
            <Arrow direction="left" />
          </Button>
          <Button
            disabled={!canGoForward}
            onClick={() => changeHistory(+1)}
            {...label("Click to go forward")}
          >
            <Arrow direction="right" />
          </Button>
          <Button
            disabled={loading}
            onClick={() => setUrl(history[position])}
            {...label("Reload this page")}
          >
            {loading ? <Stop /> : <Refresh />}
          </Button>
        </div>
        <input
          ref={inputRef}
          defaultValue={initialUrl}
          enterKeyHint="go"
          onFocusCapture={() => inputRef.current?.select()}
          onKeyDown={({ key }) => {
            if (inputRef.current && key === "Enter") {
              changeUrl(id, inputRef.current.value);
              window.getSelection()?.removeAllRanges();
              inputRef.current.blur();
            }
          }}
          type="text"
        />
      </nav>
      <nav>
        {bookmarks.map(({ name, icon, url: bookmarkUrl }) => (
          <Button
            key={name}
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = bookmarkUrl;
              }

              changeUrl(id, bookmarkUrl);
            }}
            {...label(`${name}\n${bookmarkUrl}`)}
          >
            <Icon alt={name} imgSize={16} src={icon} />
          </Button>
        ))}
      </nav>
      <iframe
        ref={iframeRef}
        onLoad={() => setLoading(false)}
        srcDoc={srcDoc || undefined}
        title={id}
        {...IFRAME_CONFIG}
      />
    </StyledBrowser>
  );
};

export default Browser;
