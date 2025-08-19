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
import {
  FILE_INDEX,
  SEARCH_INPUT_PROPS,
  SEARCH_LIB,
  useSearch,
} from "utils/search";

type SearchBarProps = {
  id: string;
};

const MAX_ENTRIES = 10;

const SearchBar: FCWithRef<HTMLInputElement, SearchBarProps> = ({
  id,
  ref: searchBarRef,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const hasUsedSearch = useRef(false);
  const {
    open,
    processes: {
      [id]: { url = "" },
    },
  } = useProcesses();
  const results = useSearch(searchTerm);
  const { contextMenu } = useMenu();
  const { fs } = useFileSystem();
  const { updateRecentFiles } = useSession();

  useEffect(() => {
    if (searchBarRef?.current && hasUsedSearch.current) {
      const searchText = searchBarRef.current.value;
      const getItems = (): Promise<MenuItem[]> =>
        Promise.all(
          [
            ...results.filter(({ ref: path }) => path.startsWith(url)),
            ...results.filter(({ ref: path }) => !path.startsWith(url)),
          ]
            .slice(0, MAX_ENTRIES - 1)
            .map(async ({ ref: path }) => {
              if (searchText !== searchBarRef.current?.value) {
                throw new Error("Search term changed");
              }

              const {
                icon,
                url: infoUrl,
                pid = "",
              } = (await getResultInfo(fs, path)) || {};

              return {
                action: () => {
                  open(pid, { url: infoUrl });
                  setSearchTerm("");

                  if (searchBarRef?.current) {
                    // eslint-disable-next-line no-param-reassign
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

      getItems()
        .then((items) => {
          if (items.length === 0) {
            contextMenu?.(() => []).onContextMenuCapture();
          } else if (searchBarRef.current?.value) {
            const searchBarRect = searchBarRef.current.getBoundingClientRect();

            contextMenu?.(() => items).onContextMenuCapture(
              undefined,
              searchBarRect,
              {
                staticY: (searchBarRect?.y || 0) + (searchBarRect?.height || 0),
              }
            );
          }
        })
        .catch(() => {
          // Ignore failure to complete search
        });
    }
  }, [contextMenu, fs, open, results, searchBarRef, updateRecentFiles, url]);

  useEffect(() => {
    if (searchBarRef?.current) {
      // eslint-disable-next-line no-param-reassign
      searchBarRef.current.value = "";
      setSearchTerm("");
    }
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [searchBarRef, url]);

  return (
    <StyledSearch>
      <input
        ref={searchBarRef}
        onChange={({ target }) => {
          hasUsedSearch.current = true;
          setSearchTerm(target.value);
        }}
        onFocus={() => preloadLibs([SEARCH_LIB, FILE_INDEX])}
        placeholder="Search"
        {...SEARCH_INPUT_PROPS}
      />
      <Search />
    </StyledSearch>
  );
};

export default memo(SearchBar);
