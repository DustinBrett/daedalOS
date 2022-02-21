import { Search } from "components/apps/FileExplorer/NavigationIcons";
import StyledSearch from "components/apps/FileExplorer/StyledSearch";
import { getIconByFileExtension } from "components/system/Files/FileEntry/functions";
import { useMenu } from "contexts/menu";
import { basename, extname } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearch } from "utils/search";

type SearchBarProps = {
  position: number;
};

const SearchBar = ({ position }: SearchBarProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const results = useSearch(searchTerm);
  const { contextMenu } = useMenu();
  const getItems = useCallback(
    () =>
      results.current.slice(0, 10).map(({ ref }) => ({
        action: () => console.info(`GO TO ${ref}`),
        icon: getIconByFileExtension(extname(ref)),
        label: basename(ref),
      })),
    [results]
  );

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.value = "";
    }
  }, [position]);

  return (
    <StyledSearch>
      <Search />
      <input
        ref={searchBarRef}
        onChange={(event) => {
          // TODO: Results are acting odd, Ex: "Japan"
          const { target } = event;
          contextMenu?.(getItems).onContextMenuCapture(event);
          setSearchTerm(target.value);
        }}
        placeholder="Search"
        spellCheck={false}
        type="text"
      />
    </StyledSearch>
  );
};

export default SearchBar;
