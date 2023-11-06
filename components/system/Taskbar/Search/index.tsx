import { Search as SearchIcon } from "components/apps/FileExplorer/NavigationIcons";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import {
  Documents,
  Pictures,
  Videos,
} from "components/system/StartMenu/Sidebar/SidebarIcons";
import Details from "components/system/Taskbar/Search/Details";
import ResultSection from "components/system/Taskbar/Search/ResultSection";
import StyledSearch from "components/system/Taskbar/Search/StyledSearch";
import StyledSections from "components/system/Taskbar/Search/StyledSections";
import StyledTabs from "components/system/Taskbar/Search/StyledTabs";
import useSearchInputTransition from "components/system/Taskbar/Search/useSearchInputTransition";
import StyledBackground from "components/system/Taskbar/StyledBackground";
import {
  SEARCH_BUTTON_LABEL,
  maybeCloseTaskbarMenu,
} from "components/system/Taskbar/functions";
import useTaskbarItemTransition from "components/system/Taskbar/useTaskbarItemTransition";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcesses } from "contexts/process";
import directory from "contexts/process/directory";
import type { Variant } from "framer-motion";
import { m as motion } from "framer-motion";
import { extname } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "styled-components";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "utils/constants";
import { haltEvent, label } from "utils/functions";
import { useSearch } from "utils/search";

type SearchProps = {
  toggleSearch: (showMenu?: boolean) => void;
};

type StyleVariant = Variant & {
  height?: string;
};

const TABS = ["All", "Documents", "Photos", "Videos"] as const;

type TabName = (typeof TABS)[number];

type TabData = {
  icon: React.JSX.Element;
  subtitle?: string;
  title: string;
};

const SUGGESTED = ["FileExplorer", "Terminal", "Messenger", "Browser", "Paint"];

const METADATA = {
  Documents: {
    icon: <Documents />,
    subtitle: "for documents",
    title: "Documents",
  },
  Photos: {
    icon: <Pictures />,
    title: "Photos",
  },
  Videos: {
    icon: <Videos />,
    title: "Videos",
  },
} as Record<TabName, TabData>;

const Search: FC<SearchProps> = ({ toggleSearch }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  // TODO: Figure these out, ranApps & pastSearches
  const ranApps = [];
  const pastSearches = [];
  const [activeTab, setActiveTab] = useState<TabName>("All");
  const {
    sizes: { search },
  } = useTheme();
  const searchTransition = useTaskbarItemTransition(
    search.maxHeight,
    true,
    0.1
  );
  const inputTransition = useSearchInputTransition();
  const { height } = (searchTransition.variants?.active as StyleVariant) ?? {};
  const delayedFocusOnRenderCallback = useCallback(
    (element: HTMLInputElement | null) => {
      setTimeout(() => element?.focus(PREVENT_SCROLL), 400);
      inputRef.current = element;
    },
    []
  );
  const focusOnRenderCallback = useCallback((element: HTMLElement | null) => {
    element?.focus(PREVENT_SCROLL);
    menuRef.current = element;
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const results = useSearch(searchTerm);
  const [bestMatch, setBestMatch] = useState("");
  const [activeItem, setActiveItem] = useState("");
  const { open } = useProcesses();
  const subResults = useMemo(
    () =>
      Object.entries(
        results.reduce(
          (acc, result) => {
            const pid = getProcessByFileExtension(extname(result.ref));

            if (pid === "Photos") {
              acc.Photos.push(result);
            } else if (pid === "VideoPlayer") {
              acc.Videos.push(result);
            } else {
              acc.Documents.push(result);
            }

            return acc;
          },
          {
            Documents: [] as lunr.Index.Result[],
            Photos: [] as lunr.Index.Result[],
            Videos: [] as lunr.Index.Result[],
          }
        )
      ).map(
        ([title, subResult]) =>
          // TODO: More results on scroll. Only show 10 each max for now
          // - Add a last entry that gets increases the count depending on the field and if it had more
          [title, subResult.slice(0, 10)] as [string, lunr.Index.Result[]]
      ),
    [results]
  );
  const firstResult = useMemo(
    () =>
      activeTab === "All"
        ? results[0]
        : Object.fromEntries(subResults)[activeTab]?.[0],
    [activeTab, results, subResults]
  );

  useEffect(() => {
    if (firstResult?.ref && (!bestMatch || bestMatch !== firstResult?.ref)) {
      setBestMatch(firstResult.ref);
      setActiveItem(firstResult.ref);
    }
  }, [bestMatch, firstResult]);

  return (
    <StyledSearch
      ref={focusOnRenderCallback}
      onBlurCapture={(event) =>
        maybeCloseTaskbarMenu(
          event,
          menuRef.current,
          toggleSearch,
          inputRef.current,
          SEARCH_BUTTON_LABEL,
          true
        )
      }
      onKeyDown={({ key }) => {
        if (key === "Escape") toggleSearch(false);
      }}
      {...searchTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <StyledBackground $height={height} />
      <div>
        <div className="content" onContextMenuCapture={haltEvent}>
          <StyledTabs>
            {TABS.map((tab) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <li
                key={tab}
                className={tab === activeTab ? "active" : undefined}
                onClick={() => {
                  if (inputRef.current) {
                    const tabText = `${activeTab}: `;
                    inputRef.current.value = (
                      tab === "All"
                        ? inputRef.current.value
                        : `${tab}: ${inputRef.current.value}`
                    ).replace(tabText, "");
                  }

                  setActiveTab(tab);
                }}
                {...label(
                  tab === "All"
                    ? "Find the most relevant results on this PC"
                    : `Find results in ${tab}`
                )}
              >
                {tab}
              </li>
            ))}
          </StyledTabs>
          <nav>
            <Button
              onClick={() => toggleSearch(false)}
              {...label("Close Search")}
            >
              <CloseIcon />
            </Button>
          </nav>
          {!searchTerm && activeTab === "All" && (
            <StyledSections>
              <section>
                <figure>
                  <figcaption>Suggested</figcaption>
                  <ol className="suggested">
                    {SUGGESTED.map((app) => (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                      <li
                        key={app}
                        onClick={() => {
                          toggleSearch(false);
                          open(app);
                        }}
                        title={directory[app].title}
                      >
                        <figure>
                          <Icon
                            displaySize={32}
                            imgSize={32}
                            src={directory[app].icon}
                          />
                          <figcaption>{directory[app].title}</figcaption>
                        </figure>
                      </li>
                    ))}
                  </ol>
                </figure>
              </section>
              {(ranApps.length > 0 || pastSearches.length > 0) && (
                <section>
                  {ranApps.length > 0 && (
                    <figure>
                      <figcaption>Top apps</figcaption>
                    </figure>
                  )}
                  {pastSearches.length > 0 && (
                    <figure>
                      <figcaption>Recent searches</figcaption>
                    </figure>
                  )}
                </section>
              )}
            </StyledSections>
          )}
          {!searchTerm && activeTab !== "All" && (
            <div className="tab">
              {METADATA[activeTab].icon}
              <h1>Search {METADATA[activeTab].title.toLowerCase()}</h1>
              <h3>
                Start typing to search{" "}
                {METADATA[activeTab].subtitle ||
                  METADATA[activeTab].title.toLowerCase()}
              </h3>
            </div>
          )}
          {searchTerm &&
            (firstResult ? (
              <div className="results">
                <div className="list">
                  {firstResult && (
                    <ResultSection
                      activeItem={activeItem}
                      results={[firstResult]}
                      searchTerm={searchTerm}
                      setActiveItem={setActiveItem}
                      title="Best match"
                      details
                    />
                  )}
                  {subResults.map(
                    ([title, subResult]) =>
                      (activeTab === "All" || activeTab === title) && (
                        <ResultSection
                          key={title}
                          activeItem={activeItem}
                          results={subResult.filter(
                            (result) => firstResult !== result
                          )}
                          searchTerm={searchTerm}
                          setActiveItem={setActiveItem}
                          title={title}
                        />
                      )
                  )}
                </div>
                <Details url={activeItem || firstResult?.ref} />
              </div>
            ) : (
              // TODO: Debounce showing this at first
              <div className="no-results">NO RESULTS</div>
            ))}
        </div>
        <motion.div className="search" {...inputTransition}>
          <SearchIcon />
          <input
            ref={delayedFocusOnRenderCallback}
            onChange={() => {
              const tabAppend = activeTab === "All" ? "" : `${activeTab}: `;
              const value = inputRef.current?.value.startsWith(tabAppend)
                ? inputRef.current?.value.replace(tabAppend, "")
                : inputRef.current?.value;

              setSearchTerm(value ?? "");
            }}
            placeholder="Type here to search"
            type="text"
          />
        </motion.div>
      </div>
    </StyledSearch>
  );
};

export default Search;
