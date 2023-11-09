import { Search as SearchIcon } from "components/apps/FileExplorer/NavigationIcons";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import {
  Documents,
  Pictures,
  Videos,
} from "components/system/StartMenu/Sidebar/SidebarIcons";
import Details from "components/system/Taskbar/Search/Details";
import { Games } from "components/system/Taskbar/Search/Icons";
import ResultSection from "components/system/Taskbar/Search/ResultSection";
import StyledFiles from "components/system/Taskbar/Search/StyledFiles";
import StyledResults from "components/system/Taskbar/Search/StyledResults";
import StyledSearch from "components/system/Taskbar/Search/StyledSearch";
import StyledSections from "components/system/Taskbar/Search/StyledSections";
import StyledSuggestions from "components/system/Taskbar/Search/StyledSuggestions";
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
import { useSession } from "contexts/session";
import type { Variant } from "framer-motion";
import { m as motion } from "framer-motion";
import { basename, extname } from "path";
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

const MAX_SINGLE_LINE = 550;

export const SINGLE_LINE_HEIGHT_ADDITION = 34;

export type TabName = (typeof TABS)[number];

type TabData = {
  icon: React.JSX.Element;
  subtitle?: string;
  title: string;
};

export const NO_RESULTS = "NO_RESULTS";

const SUGGESTED = ["FileExplorer", "Terminal", "Messenger", "Browser", "Paint"];

const GAMES = ["SpaceCadet", "Quake3", "DXBall"];

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
  const { recentFiles } = useSession();
  const [activeTab, setActiveTab] = useState<TabName>("All");
  const {
    sizes: { search },
  } = useTheme();
  const [singleLineView, setSingleLineView] = useState(false);
  const searchTransition = useTaskbarItemTransition(
    search.maxHeight + (singleLineView ? SINGLE_LINE_HEIGHT_ADDITION : 0),
    true,
    0.1,
    0
  );
  const inputTransition = useSearchInputTransition();
  const { height } = (searchTransition.variants?.active as StyleVariant) ?? {};
  const [showCaret, setShowCaret] = useState(false);
  const focusOnRenderCallback = useCallback(
    (element: HTMLInputElement | null) => {
      element?.focus(PREVENT_SCROLL);
      setTimeout(() => setShowCaret(true), 400);
      inputRef.current = element;
    },
    []
  );
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
  const changeTab = useCallback(
    (tab: TabName) => {
      if (inputRef.current) {
        inputRef.current.value = (
          tab === "All"
            ? inputRef.current.value
            : `${tab}: ${inputRef.current.value}`
        ).replace(`${activeTab}: `, "");
      }

      setActiveItem("");
      setActiveTab(tab);
    },
    [activeTab]
  );

  useEffect(() => {
    if (
      firstResult?.ref &&
      (!bestMatch || bestMatch !== firstResult?.ref || !activeItem)
    ) {
      setBestMatch(firstResult.ref);

      if (menuRef.current && menuRef.current.clientWidth > MAX_SINGLE_LINE) {
        setActiveItem(firstResult.ref);
      }
    } else if (!firstResult && activeItem) {
      setActiveItem("");
    }
  }, [activeItem, bestMatch, firstResult]);

  useEffect(() => {
    const checkMenuWidth = (): void =>
      setSingleLineView(
        menuRef.current ? menuRef.current.clientWidth < MAX_SINGLE_LINE : false
      );

    checkMenuWidth();

    window.addEventListener("resize", checkMenuWidth);

    return () => window.removeEventListener("resize", checkMenuWidth);
  }, []);

  return (
    <StyledSearch
      ref={menuRef}
      $singleLine={singleLineView}
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
                onClick={() => changeTab(tab)}
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
              className="close-button"
              onClick={() => toggleSearch(false)}
              {...label("Close Search")}
            >
              <CloseIcon />
            </Button>
          </nav>
          {!searchTerm && activeTab === "All" && (
            <StyledSections
              $singleLine={singleLineView}
              className={singleLineView ? "single-line" : undefined}
            >
              <section>
                <figure>
                  <figcaption>Suggested</figcaption>
                  <StyledSuggestions>
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
                  </StyledSuggestions>
                </figure>
              </section>
              <section>
                {recentFiles.length > 0 && (
                  <StyledFiles>
                    <figcaption>Recent</figcaption>
                    <ol>
                      {recentFiles.map(([file, pid]) => (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                        <li key={file} onClick={() => open(pid, { url: file })}>
                          <Icon
                            displaySize={16}
                            imgSize={16}
                            src={directory[pid]?.icon}
                          />
                          <h2>{basename(file, extname(file))}</h2>
                        </li>
                      ))}
                    </ol>
                  </StyledFiles>
                )}
                <figure className="card">
                  <figcaption>
                    <Games />
                    Games for you
                  </figcaption>
                  <ol>
                    {GAMES.map(
                      (game) =>
                        directory[game] && (
                          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                          <li
                            key={game}
                            onClick={() => open(game)}
                            title={directory[game].title}
                          >
                            <Icon
                              displaySize={48}
                              imgSize={48}
                              src={directory[game].icon}
                            />
                            <h4>{directory[game].title}</h4>
                          </li>
                        )
                    )}
                  </ol>
                </figure>
              </section>
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
          {searchTerm && (
            <StyledResults>
              {(!singleLineView || !activeItem) && (
                <div className="list">
                  <ResultSection
                    activeItem={activeItem}
                    activeTab={activeTab}
                    results={[firstResult || { ref: NO_RESULTS }]}
                    searchTerm={searchTerm}
                    setActiveItem={setActiveItem}
                    title={"Best match" as TabName}
                    details
                  />
                  {subResults.map(
                    ([title, subResult]) =>
                      (activeTab === "All" || activeTab === title) && (
                        <ResultSection
                          key={title}
                          activeItem={activeItem}
                          activeTab={activeTab}
                          changeTab={changeTab}
                          results={subResult.filter(
                            (result) => firstResult !== result
                          )}
                          searchTerm={searchTerm}
                          setActiveItem={setActiveItem}
                          title={title as TabName}
                        />
                      )
                  )}
                </div>
              )}
              {activeItem && firstResult && (
                <Details
                  setActiveItem={setActiveItem}
                  singleLineView={singleLineView}
                  url={activeItem || firstResult?.ref}
                />
              )}
            </StyledResults>
          )}
        </div>
        <motion.div className="search" {...inputTransition}>
          <SearchIcon />
          <input
            ref={focusOnRenderCallback}
            onChange={() => {
              const tabAppend = activeTab === "All" ? "" : `${activeTab}: `;
              const value = inputRef.current?.value.startsWith(tabAppend)
                ? inputRef.current?.value.replace(tabAppend, "")
                : inputRef.current?.value;

              setSearchTerm(value ?? "");
            }}
            onKeyDown={({ key }) => {
              if (key === "Enter" && firstResult?.ref) {
                const bestMatchElement = menuRef.current?.querySelector(
                  ".list li:first-child figure"
                );

                (bestMatchElement as HTMLElement)?.click();
              }
            }}
            placeholder="Type here to search"
            style={{
              caretColor: showCaret ? undefined : "transparent",
            }}
            type="text"
          />
        </motion.div>
      </div>
    </StyledSearch>
  );
};

export default Search;
