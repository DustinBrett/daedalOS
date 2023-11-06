import ResultEntry from "components/system/Taskbar/Search/ResultEntry";

type ResultsSectionProps = {
  activeItem: string;
  details?: boolean;
  results: lunr.Index.Result[];
  searchTerm: string;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  title: string;
};

const ResultSection: FC<ResultsSectionProps> = ({
  activeItem,
  details,
  results,
  searchTerm,
  setActiveItem,
  title,
}) =>
  results.length > 0 ? (
    <figure>
      <figcaption>{title}</figcaption>
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
