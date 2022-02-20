import { ROOT_NAME } from "components/apps/FileExplorer/config";
import {
  Back,
  Down,
  Forward,
  Refresh,
  Up,
} from "components/apps/FileExplorer/NavigationIcons";
import StyledAddressBar from "components/apps/FileExplorer/StyledAddressBar";
import StyledNavigation from "components/apps/FileExplorer/StyledNavigation";
import StyledSearch from "components/apps/FileExplorer/StyledSearch";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import { useProcesses } from "contexts/process";
import useHistory from "hooks/useHistory";
import { basename, dirname } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "styles/common/Button";
import { useSearch } from "utils/search";

type NavigationProps = {
  id: string;
};

const Navigation = ({ id }: NavigationProps): JSX.Element => {
  const {
    url: changeUrl,
    processes: {
      [id]: { icon, url = "" },
    },
  } = useProcesses();
  const { exists, updateFolder } = useFileSystem();
  const displayName = basename(url) || ROOT_NAME;
  const [addressBar, setAddressBar] = useState(displayName);
  const [searchTerm, setSearchTerm] = useState("");
  const results = useSearch(searchTerm);
  const upTo = url !== "/" ? basename(dirname(url)) : undefined;
  const { contextMenu } = useMenu();
  const addressBarRef = useRef<HTMLInputElement | null>(null);
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const { canGoBack, canGoForward, history, moveHistory, position } =
    useHistory(url, id);
  const getItems = useCallback(
    () =>
      history.map((historyUrl, index) => ({
        action: () => moveHistory(index - position),
        checked: position === index,
        label: basename(historyUrl) || ROOT_NAME,
        primary: position === index,
      })),
    [history, moveHistory, position]
  );
  const style = useMemo(
    () => ({
      backgroundImage: `url('${icon.replace("/Icons/", "/Icons/16x16/")}')`,
    }),
    [icon]
  );
  if (results.length > 0) console.info({ results });
  useEffect(() => {
    if (addressBarRef.current) {
      if (addressBar === url) {
        addressBarRef.current.select();
      } else if (addressBar === displayName) {
        window.getSelection()?.removeAllRanges();
      } else if (document.activeElement !== addressBarRef.current) {
        setAddressBar(displayName);
      }
    }
  }, [addressBar, displayName, url]);

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.value = "";
    }
  }, [position]);

  return (
    <StyledNavigation>
      <Button
        disabled={!canGoBack}
        onClick={() => moveHistory(-1)}
        title={
          canGoBack
            ? `Back to ${basename(history[position - 1]) || ROOT_NAME}`
            : "Back"
        }
      >
        <Back />
      </Button>
      <Button
        disabled={!canGoForward}
        onClick={() => moveHistory(+1)}
        title={
          canGoForward
            ? `Forward to ${basename(history[position + 1]) || ROOT_NAME}`
            : "Forward"
        }
      >
        <Forward />
      </Button>
      <Button
        disabled={history.length === 1}
        onClick={contextMenu?.(getItems).onContextMenuCapture}
        title="Recent locations"
      >
        <Down />
      </Button>
      <Button
        disabled={url === "/"}
        onClick={() => changeUrl(id, dirname(url))}
        title={
          url === "/"
            ? "Up one level"
            : `Up to "${upTo === "" ? ROOT_NAME : upTo}"`
        }
      >
        <Up />
      </Button>
      <StyledAddressBar
        ref={addressBarRef}
        onBlur={() => setAddressBar(displayName)}
        onChange={({ target }) => setAddressBar(target.value)}
        onFocus={() => setAddressBar(url)}
        onKeyDown={async ({ key }) => {
          if (key === "Enter" && addressBarRef.current) {
            const { value } = addressBarRef.current || {};

            if (value && (await exists(value))) {
              changeUrl(id, value);
            }

            addressBarRef.current.blur();
          }
        }}
        style={style}
        value={addressBar}
      />
      <Button id="refresh" onClick={() => updateFolder(url)} title="Refresh">
        <Refresh />
      </Button>
      <StyledSearch
        ref={searchBarRef}
        onChange={({ target }) => setSearchTerm(target.value)}
        placeholder={`Search ${displayName}`}
      />
    </StyledNavigation>
  );
};

export default Navigation;
