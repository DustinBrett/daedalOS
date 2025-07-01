import { basename, extname } from "path";
import { useTheme } from "styled-components";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { m as motion } from "motion/react";
import dynamic from "next/dynamic";
import { Search as SearchIcon } from "components/apps/FileExplorer/NavigationIcons";
import {
  getCachedShortcut,
  getProcessByFileExtension,
  getShortcutInfo,
  isExistingFile,
} from "components/system/Files/FileEntry/functions";
import {
  Documents,
  Pictures,
  Videos,
} from "components/system/StartMenu/Sidebar/SidebarIcons";
import { Games } from "components/system/Taskbar/Search/Icons";
import StyledFiles from "components/system/Taskbar/Search/StyledFiles";
import StyledResults from "components/system/Taskbar/Search/StyledResults";
import StyledSearch from "components/system/Taskbar/Search/StyledSearch";
import StyledSections from "components/system/Taskbar/Search/StyledSections";
import StyledSuggestions from "components/system/Taskbar/Search/StyledSuggestions";
import StyledTabs from "components/system/Taskbar/Search/StyledTabs";
import useSearchInputTransition from "components/system/Taskbar/Search/useSearchInputTransition";
import {
  SEARCH_BUTTON_TITLE,
  maybeCloseTaskbarMenu,
} from "components/system/Taskbar/functions";
import useTaskbarItemTransition from "components/system/Taskbar/useTaskbarItemTransition";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import directory from "contexts/process/directory";
import { type ProcessArguments } from "contexts/process/types";
import { useSession } from "contexts/session";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  FOCUSABLE_ELEMENT,
  KEYPRESS_DEBOUNCE_MS,
  MILLISECONDS_IN_SECOND,
  PICTURES_FOLDER,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
  TRANSITIONS_IN_SECONDS,
  VIDEOS_FOLDER,
} from "utils/constants";
import { haltEvent, label, preloadLibs } from "utils/functions";
import {
  FILE_INDEX,
  SEARCH_INPUT_PROPS,
  SEARCH_LIB,
  useSearch,
} from "utils/search";

type SearchProps = {
  toggleSearch: (showMenu?: boolean) => void;
};

const TABS = ["All", "Documents", "Photos", "Videos"] as const;

const MIN_MULTI_LINE = 550;

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

const Details = dynamic(
  () => import("components/system/Taskbar/Search/Details")
);
const ResultSection = dynamic(
  () => import("components/system/Taskbar/Search/ResultSection")
);

const Search: FC<SearchProps> = ({ toggleSearch }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const { recentFiles, updateRecentFiles } = useSession();
  const { lstat, readFile } = useFileSystem();
  const [activeTab, setActiveTab] = useState<TabName>("All");
  const {
    sizes: { search },
  } = useTheme();
  const [menuWidth, setMenuWidth] = useState(MIN_MULTI_LINE);
  const singleLineView = menuWidth < MIN_MULTI_LINE;
  const searchTransition = useTaskbarItemTransition(
    search.maxHeight + (singleLineView ? SINGLE_LINE_HEIGHT_ADDITION : 0),
    true,
    0.1,
    0
  );
  const inputTransition = useSearchInputTransition();
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
  const [subResults, setSubResults] = useState<[string, lunr.Index.Result[]][]>(
    []
  );
  const firstResult = useMemo(
    () =>
      activeTab === "All"
        ? results[0]
        : Object.fromEntries(subResults)[activeTab]?.[0],
    [activeTab, results, subResults]
  );
  const listRef = useRef<HTMLDivElement | null>(null);
  const changeTab = useCallback(
    (tab: TabName) => {
      if (inputRef.current) {
        inputRef.current.value = (
          tab === "All"
            ? inputRef.current.value
            : `${tab}: ${inputRef.current.value}`
        ).replace(`${activeTab}: `, "");
        listRef.current?.scrollTo(0, 0);
      }

      setActiveItem("");
      setActiveTab(tab);
    },
    [activeTab]
  );
  const openApp = useCallback(
    (pid: string, args?: ProcessArguments) => {
      toggleSearch(false);
      open(pid, args);
    },
    [open, toggleSearch]
  );
  const searchTimeoutRef = useRef(0);
  const preloadedSearch = useRef(false);
  const preloadSearch = useCallback(() => {
    if (!preloadedSearch.current) {
      preloadedSearch.current = true;
      preloadLibs([SEARCH_LIB, FILE_INDEX]);
    }
  }, []);

  useEffect(() => {
    if (
      firstResult?.ref &&
      (!bestMatch || bestMatch !== firstResult?.ref || !activeItem)
    ) {
      setBestMatch(firstResult.ref);

      if (menuRef.current && menuRef.current.clientWidth > MIN_MULTI_LINE) {
        setActiveItem(firstResult.ref);
      }
    } else if (!firstResult && activeItem) {
      setActiveItem("");
    }
  }, [activeItem, bestMatch, firstResult]);

  useEffect(() => {
    const updateMenuWidth = (): void =>
      setMenuWidth(menuRef.current?.clientWidth || 0);

    updateMenuWidth();

    window.addEventListener("resize", updateMenuWidth);

    return () => window.removeEventListener("resize", updateMenuWidth);
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      results
        .reduce(
          async (acc, result) => {
            const currentResults = await acc;
            const extension = extname(result.ref);
            let pid = "";

            if (extension === SHORTCUT_EXTENSION) {
              if (result.ref.startsWith(`${PICTURES_FOLDER}/`)) pid = "Photos";
              else if (result.ref.startsWith(`${VIDEOS_FOLDER}/`)) {
                pid = "VideoPlayer";
              } else {
                ({ pid } = isExistingFile(await lstat(result.ref))
                  ? getCachedShortcut(result.ref)
                  : getShortcutInfo(await readFile(result.ref)));
              }
            } else pid = getProcessByFileExtension(extension);

            if (pid === "Photos") {
              currentResults.Photos.push(result);
            } else if (pid === "VideoPlayer") {
              currentResults.Videos.push(result);
            } else {
              currentResults.Documents.push(result);
            }

            return currentResults;
          },
          Promise.resolve({
            Documents: [] as lunr.Index.Result[],
            Photos: [] as lunr.Index.Result[],
            Videos: [] as lunr.Index.Result[],
          })
        )
        .then((newResults) => setSubResults(Object.entries(newResults)));
    } else {
      setSubResults([]);
    }
  }, [lstat, readFile, results]);

  return (
    <StyledSearch
      ref={menuRef}
      $singleLine={singleLineView}
      id="searchMenu"
      onBlurCapture={(event) =>
        maybeCloseTaskbarMenu(
          event,
          menuRef.current,
          toggleSearch,
          inputRef.current,
          SEARCH_BUTTON_TITLE,
          true
        )
      }
      onKeyDown={({ key }) => {
        if (key === "Escape") toggleSearch(false);
      }}
      {...searchTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <div>
        <div className="content" onContextMenu={haltEvent}>
          <StyledTabs>
            {TABS.filter(
              (tab) =>
                !(menuWidth < 325 && tab === "Videos") &&
                !(menuWidth < 260 && tab === "Photos")
            ).map((tab) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <li
                key={tab}
                className={tab === activeTab ? "active" : undefined}
                onClick={() => changeTab(tab)}
                {...label(
                  tab === "All"
                    ? "Find the most relevant results"
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
                        onClick={() => openApp(app)}
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
                      {recentFiles.map(([file, pid, title], index) => (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                        <li
                          key={`${file}${pid}`}
                          onClick={() => {
                            openApp(pid, { url: file });
                            if (index !== 0) {
                              setTimeout(
                                () => updateRecentFiles(file, pid, title),
                                TRANSITIONS_IN_SECONDS.TASKBAR_ITEM *
                                  MILLISECONDS_IN_SECOND
                              );
                            }
                          }}
                        >
                          <Icon
                            displaySize={16}
                            imgSize={16}
                            src={directory[pid]?.icon}
                          />
                          <h2>{title || basename(file, extname(file))}</h2>
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
                    {GAMES.filter(
                      (game) =>
                        !(menuWidth < 360 && game === "Quake3") &&
                        !(menuWidth < 260 && game === "SpaceCadet")
                    ).map(
                      (game) =>
                        directory[game] && (
                          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                          <li
                            key={game}
                            onClick={() => openApp(game)}
                            title={directory[game].title}
                          >
                            <Icon
                              displaySize={56}
                              imgSize={96}
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
                <div ref={listRef} className="list">
                  <ResultSection
                    activeItem={activeItem}
                    activeTab={activeTab}
                    openApp={openApp}
                    results={[firstResult || { ref: NO_RESULTS }]}
                    searchTerm={searchTerm}
                    setActiveItem={setActiveItem}
                    title={"Best match" as TabName}
                    details
                  />
                  {results.length > 1 &&
                    subResults.map(
                      ([title, subResult]) =>
                        (activeTab === "All" || activeTab === title) && (
                          <ResultSection
                            key={title}
                            activeItem={activeItem}
                            activeTab={activeTab}
                            changeTab={changeTab}
                            openApp={openApp}
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
                  openApp={openApp}
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

              window.clearTimeout(searchTimeoutRef.current);
              searchTimeoutRef.current = window.setTimeout(
                () => setSearchTerm(value ?? ""),
                searchTimeoutRef.current > 0 ? KEYPRESS_DEBOUNCE_MS : 0
              );
            }}
            onClick={preloadedSearch.current ? undefined : preloadSearch}
            onKeyDown={({ key }) => {
              preloadSearch();

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
            {...SEARCH_INPUT_PROPS}
          />
        </motion.div>
      </div>
    </StyledSearch>
  );
};

export default memo(Search);
