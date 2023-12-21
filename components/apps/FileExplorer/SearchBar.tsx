import { basename } from "path";
import { memo, useEffect, useRef, useState } from "react";
import { Search } from "components/apps/FileExplorer/NavigationIcons";
import StyledSearch from "components/apps/FileExplorer/StyledSearch";
import { getResultInfo } from "components/system/Taskbar/Search/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import { type MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { SHORTCUT_EXTENSION } from "utils/constants";
import { preloadLibs } from "utils/functions";
import { SEARCH_INPUT_PROPS, SEARCH_LIBS, useSearch } from "utils/search";

type SearchBarProps = {
  id: string;
};

const MAX_ENTRIES = 10;

const SearchBar: FC<SearchBarProps> = ({ id }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const hasUsedSearch = useRef(false);
  const {
    open,
    processes: {
      [id]: { url = "" },
    },
  } = useProcesses();
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const results = useSearch(searchTerm);
  const { contextMenu } = useMenu();
  const { fs } = useFileSystem();
  const { updateRecentFiles } = useSession();

  useEffect(() => {
    if (searchBarRef.current && hasUsedSearch.current) {
      const getItems = (): Promise<MenuItem[]> =>
        Promise.all(
          [
            ...results.filter(({ ref: path }) => path.startsWith(url)),
            ...results.filter(({ ref: path }) => !path.startsWith(url)),
          ]
            .slice(0, MAX_ENTRIES - 1)
            .map(async ({ ref: path }) => {
              const {
                icon,
                url: infoUrl,
                pid = "",
              } = (await getResultInfo(fs, path)) || {};

              return {
                action: () => {
                  open(pid, { url: infoUrl });
                  setSearchTerm("");

                  if (searchBarRef.current) {
                    searchBarRef.current.value = "";
                    searchBarRef.current.blur();
                  }
                  if (infoUrl && pid) updateRecentFiles(infoUrl, pid);
                },
                icon,
                label: basename(path, SHORTCUT_EXTENSION),
                tooltip: path,
              };
            })
        );

      getItems().then((items) => {
        const searchBarRect = searchBarRef.current?.getBoundingClientRect();

        contextMenu?.(() => items).onContextMenuCapture(
          undefined,
          searchBarRect,
          { staticY: (searchBarRect?.y || 0) + (searchBarRect?.height || 0) }
        );
      });
    }
  }, [contextMenu, fs, open, results, updateRecentFiles, url]);

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.value = "";
      setSearchTerm("");
    }
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [url]);

  return (
    <StyledSearch>
      <input
        ref={searchBarRef}
        onChange={({ target }) => {
          hasUsedSearch.current = true;
          setSearchTerm(target.value);
        }}
        onFocus={() => preloadLibs(SEARCH_LIBS)}
        placeholder="Search"
        {...SEARCH_INPUT_PROPS}
      />
      <Search />
    </StyledSearch>
  );
};

export default memo(SearchBar);
