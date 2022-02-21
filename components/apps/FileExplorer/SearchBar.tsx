import { ROOT_NAME } from "components/apps/FileExplorer/config";
import { Search } from "components/apps/FileExplorer/NavigationIcons";
import StyledSearch from "components/apps/FileExplorer/StyledSearch";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useEffect, useRef, useState } from "react";
import { useSearch } from "utils/search";

type SearchBarProps = {
  id: string;
  position: number;
};

const SearchBar = ({ id, position }: SearchBarProps): JSX.Element => {
  const {
    processes: {
      [id]: { url = "" },
    },
  } = useProcesses();
  const displayName = basename(url) || ROOT_NAME;
  const [searchTerm, setSearchTerm] = useState("");
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const results = useSearch(searchTerm);

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.value = "";
    }
  }, [position]);

  if (results.length > 0) console.info({ results });

  return (
    <StyledSearch>
      <Search />
      <input
        ref={searchBarRef}
        onChange={({ target }) => setSearchTerm(target.value)}
        placeholder={`Search ${displayName}`}
        spellCheck={false}
        type="text"
      />
    </StyledSearch>
  );
};

export default SearchBar;
