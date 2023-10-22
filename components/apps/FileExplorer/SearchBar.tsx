import type { FSModule } from "browserfs/dist/node/core/FS";
import { Search } from "components/apps/FileExplorer/NavigationIcons";
import StyledSearch from "components/apps/FileExplorer/StyledSearch";
import { getInfoWithExtension } from "components/system/Files/FileEntry/functions";
import type { FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { basename, join } from "path";
import { memo, useEffect, useRef, useState } from "react";
import {
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  SHORTCUT_EXTENSION,
  TEXT_EDITORS,
  YT_ICON_CACHE,
} from "utils/constants";
import {
  bufferToUrl,
  getExtension,
  isYouTubeUrl,
  preloadLibs,
} from "utils/functions";
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
  const { exists, fs, readFile } = useFileSystem();

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
                pid = TEXT_EDITORS[0],
                url: infoUrl,
              } = await new Promise<FileInfo>((resolve) => {
                getInfoWithExtension(
                  fs as FSModule,
                  path,
                  getExtension(path),
                  (fileInfo) => resolve(fileInfo)
                );
              });
              const isYT = isYouTubeUrl(infoUrl);
              const cachedIconPath = join(
                isYT ? YT_ICON_CACHE : ICON_CACHE,
                `${
                  isYT ? new URL(infoUrl).pathname.replace("/", "") : infoUrl
                }${ICON_CACHE_EXTENSION}`
              );
              let cachedIcon = "";

              if (await exists(cachedIconPath)) {
                cachedIcon = bufferToUrl(await readFile(cachedIconPath));
              }

              return {
                action: () => {
                  open(pid, { url: infoUrl || path });
                  setSearchTerm("");

                  if (searchBarRef.current) {
                    searchBarRef.current.value = "";
                    searchBarRef.current.blur();
                  }
                },
                icon: cachedIcon || icon,
                label: basename(path, SHORTCUT_EXTENSION),
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
  }, [contextMenu, exists, fs, open, readFile, results, url]);

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.value = "";
      setSearchTerm("");
    }
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
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

export default memo(SearchBar);
