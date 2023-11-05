import { Search as SearchIcon } from "components/apps/FileExplorer/NavigationIcons";
import {
  Documents,
  Pictures,
  Videos,
} from "components/system/StartMenu/Sidebar/SidebarIcons";
import StyledSearch from "components/system/Taskbar/Search/StyledSearch";
import useSearchInputTransition from "components/system/Taskbar/Search/useSearchInputTransition";
import StyledBackground from "components/system/Taskbar/StyledBackground";
import useTaskbarItemTransition from "components/system/Taskbar/useTaskbarItemTransition";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcesses } from "contexts/process";
import directory from "contexts/process/directory";
import type { Variant } from "framer-motion";
import { m as motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useTheme } from "styled-components";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "utils/constants";
import { haltEvent, label } from "utils/functions";
import { maybeCloseTaskbarMenu } from "../functions";

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

const SUGGESTED = [
  "FileExplorer",
  "Terminal",
  "Messenger",
  "Browser",
  "Paint",
] as const;

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
  const focusRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const ranApps = [];
  const pastSearches = [];
  const [activeTab, setActiveTab] = useState<TabName>("All");
  const {
    sizes: { search },
  } = useTheme();
  const searchTransition = useTaskbarItemTransition(
    search.maxHeight,
    true,
    0.05
  );
  const inputTransition = useSearchInputTransition();
  const { height } = (searchTransition.variants?.active as StyleVariant) ?? {};
  const focusOnRenderCallback = useCallback(
    (element: HTMLInputElement | null) => {
      element?.focus(PREVENT_SCROLL);
      focusRef.current = element;
    },
    []
  );
  const { open } = useProcesses();

  return (
    <StyledSearch
      ref={menuRef}
      onBlurCapture={(event) =>
        maybeCloseTaskbarMenu(
          event,
          menuRef.current,
          toggleSearch,
          focusRef.current,
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
          <ol className="tabs">
            {TABS.map((tab) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <li
                key={tab}
                className={tab === activeTab ? "active" : undefined}
                onClick={() => setActiveTab(tab)}
                {...label(
                  tab === "All"
                    ? "Find the most relevant results on this PC"
                    : `Find results in ${tab}`
                )}
              >
                {tab}
              </li>
            ))}
          </ol>
          <nav>
            <Button
              onClick={() => toggleSearch(false)}
              {...label("Close Search")}
            >
              <CloseIcon />
            </Button>
          </nav>
          {activeTab === "All" && (
            <div className="sections">
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
            </div>
          )}
          {activeTab !== "All" && (
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
        </div>
        <motion.div className="search" {...inputTransition}>
          <SearchIcon />
          <input
            ref={focusOnRenderCallback}
            // BUG: Text jiggles during animation
            placeholder="Type here to search"
            type="text"
          />
        </motion.div>
      </div>
    </StyledSearch>
  );
};

export default Search;
