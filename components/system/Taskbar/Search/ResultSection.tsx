import { memo, useMemo } from "react";
import { Search as SearchIcon } from "components/apps/FileExplorer/NavigationIcons";
import { NO_RESULTS, type TabName } from "components/system/Taskbar/Search";
import ResultEntry from "components/system/Taskbar/Search/ResultEntry";
import StyledResultsHeader from "components/system/Taskbar/Search/StyledResultsHeader";
import { type ProcessArguments } from "contexts/process/types";

type ResultsSectionProps = {
  activeItem: string;
  activeTab: TabName;
  changeTab?: (tab: TabName) => void;
  details?: boolean;
  openApp: (pid: string, args?: ProcessArguments) => void;
  results: lunr.Index.Result[];
  searchTerm: string;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  title: TabName;
};

const ResultSection: FC<ResultsSectionProps> = ({
  activeTab,
  activeItem,
  details,
  openApp,
  results,
  searchTerm,
  setActiveItem,
  changeTab,
  title,
}) => {
  const noResults = useMemo(
    () => results.length === 1 && results[0].ref === NO_RESULTS,
    [results]
  );

  return results.length === 0 ? (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  ) : (
    <figure>
      <StyledResultsHeader
        className={
          activeTab === title || (title as string) === "Best match"
            ? "disabled"
            : undefined
        }
        onClick={() => changeTab?.(title)}
      >
        {title}
      </StyledResultsHeader>
      <ol>
        {noResults ? (
          <li className="no-results">
            <SearchIcon />
            No results found for &apos;{searchTerm}&apos;
          </li>
        ) : (
          results.map(({ ref }) => (
            <ResultEntry
              key={`${title}-${ref}`}
              active={activeItem === ref}
              details={details}
              openApp={openApp}
              searchTerm={searchTerm}
              setActiveItem={setActiveItem}
              url={ref}
            />
          ))
        )}
      </ol>
    </figure>
  );
};

export default memo(ResultSection);
