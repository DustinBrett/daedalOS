import type { TabName } from "components/system/Taskbar/Search";
import ResultEntry from "components/system/Taskbar/Search/ResultEntry";
import StyledResultsHeader from "./StyledResultsHeader";

type ResultsSectionProps = {
  activeItem: string;
  activeTab: TabName;
  changeTab?: (tab: TabName) => void;
  details?: boolean;
  results: lunr.Index.Result[];
  searchTerm: string;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  title: TabName;
};

const ResultSection: FC<ResultsSectionProps> = ({
  activeTab,
  activeItem,
  details,
  results,
  searchTerm,
  setActiveItem,
  changeTab,
  title,
}) =>
  results.length > 0 ? (
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
        {results.map(({ ref }) => (
          <ResultEntry
            key={ref}
            active={activeItem === ref}
            details={details}
            searchTerm={searchTerm}
            setActiveItem={setActiveItem}
            url={ref}
          />
        ))}
      </ol>
    </figure>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  );

export default ResultSection;
