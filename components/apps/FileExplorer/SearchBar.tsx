import { Search } from "components/apps/FileExplorer/NavigationIcons";
import StyledSearch from "components/apps/FileExplorer/StyledSearch";
import {
  getIconByFileExtension,
  getProcessByFileExtension,
} from "components/system/Files/FileEntry/functions";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { basename, extname } from "path";
import { useEffect, useRef, useState } from "react";
import { UNKNOWN_ICON_PATH } from "utils/constants";
import { preloadLibs } from "utils/functions";
import { SEARCH_LIBS, useSearch } from "utils/search";

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

  useEffect(() => {
    if (searchBarRef.current && hasUsedSearch.current) {
      const getItems = (): MenuItem[] =>
        [
          ...results.filter(({ ref: path }) => path.startsWith(url)),
          ...results.filter(({ ref: path }) => !path.startsWith(url)),
        ]
          .slice(0, MAX_ENTRIES - 1)
          .map(({ ref: path }) => ({
            action: () => {
              open(getProcessByFileExtension(extname(path)), { url: path });
              setSearchTerm("");

              if (searchBarRef.current) {
                searchBarRef.current.value = "";
                searchBarRef.current.blur();
              }
            },
            icon: getIconByFileExtension(extname(path)),
            label: basename(path),
          }))
          .filter(({ icon }) => icon !== UNKNOWN_ICON_PATH);

      contextMenu?.(getItems).onContextMenuCapture(
        undefined,
        searchBarRef.current.getBoundingClientRect()
      );
    }
  }, [contextMenu, open, results, url]);

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.value = "";
      setSearchTerm("");
    }
  }, [url]);

  return (
    <StyledSearch>
      <Search />
      <input
        ref={searchBarRef}
        aria-label="Search box"
        enterKeyHint="search"
        onChange={({ target }) => {
          hasUsedSearch.current = true;
          setSearchTerm(target.value);
        }}
        onFocus={() => preloadLibs(SEARCH_LIBS)}
        placeholder="Search"
        spellCheck={false}
        type="text"
      />
    </StyledSearch>
  );
};

export default SearchBar;
