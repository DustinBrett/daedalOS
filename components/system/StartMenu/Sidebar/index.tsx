import { useTheme } from "styled-components";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import SidebarButton, {
  type SidebarButtons,
} from "components/system/StartMenu/Sidebar/SidebarButton";
import {
  AllApps,
  Documents,
  Pictures,
  Power,
  SideMenu,
  Videos,
} from "components/system/StartMenu/Sidebar/SidebarIcons";
import StyledSidebar from "components/system/StartMenu/Sidebar/StyledSidebar";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { HOME, TASKBAR_HEIGHT } from "utils/constants";
import { haltEvent, viewHeight } from "utils/functions";

type SidebarGroupProps = {
  sidebarButtons: SidebarButtons;
};

const SidebarGroup: FC<SidebarGroupProps> = ({ sidebarButtons }) => (
  <ol>
    {sidebarButtons.map((button) => (
      <SidebarButton key={button.name} {...button} />
    ))}
  </ol>
);

type SidebarProps = {
  height?: string;
};

const Sidebar: FC<SidebarProps> = ({ height }) => {
  const { rootFs } = useFileSystem();
  const { open } = useProcesses();
  const { setHaltSession } = useSession();
  const [collapsed, setCollapsed] = useState(true);
  const expandTimer = useRef(0);
  const sidebarRef = useRef<HTMLElement>(null);
  const clearTimer = (): void => {
    if (expandTimer.current) {
      clearTimeout(expandTimer.current);
      expandTimer.current = 0;
    }
  };
  const topButtons: SidebarButtons = useMemo(
    () => [
      {
        heading: true,
        icon: <SideMenu />,
        name: "START",
        ...(collapsed && { tooltip: "Expand" }),
      },
      {
        active: true,
        icon: <AllApps />,
        name: "All apps",
        ...(collapsed && { tooltip: "All apps" }),
      },
    ],
    [collapsed]
  );
  const { sizes } = useTheme();
  const vh = viewHeight();
  const buttonAreaCount = useMemo(
    () => Math.floor((vh - TASKBAR_HEIGHT) / sizes.startMenu.sideBar.width),
    [sizes.startMenu.sideBar.width, vh]
  );
  const bottomButtons = useMemo(
    () =>
      [
        buttonAreaCount > 3
          ? {
              action: () =>
                open(
                  "FileExplorer",
                  { url: `${HOME}/Documents` },
                  "/System/Icons/documents.webp"
                ),
              icon: <Documents />,
              name: "Documents",
              ...(collapsed && { tooltip: "Documents" }),
            }
          : undefined,
        buttonAreaCount > 4
          ? {
              action: () =>
                open(
                  "FileExplorer",
                  { url: `${HOME}/Pictures` },
                  "/System/Icons/pictures.webp"
                ),
              icon: <Pictures />,
              name: "Pictures",
              ...(collapsed && { tooltip: "Pictures" }),
            }
          : undefined,
        buttonAreaCount > 5
          ? {
              action: () =>
                open(
                  "FileExplorer",
                  { url: `${HOME}/Videos` },
                  "/System/Icons/videos.webp"
                ),
              icon: <Videos />,
              name: "Videos",
              ...(collapsed && { tooltip: "Videos" }),
            }
          : undefined,
        {
          action: () => {
            setHaltSession(true);

            import("contexts/fileSystem/functions").then(({ resetStorage }) =>
              resetStorage(rootFs).finally(() => window.location.reload())
            );
          },
          icon: <Power />,
          name: "Power",
          tooltip: "Clears session data and reloads the page.",
        },
      ].filter(Boolean) as SidebarButtons,
    [buttonAreaCount, collapsed, open, rootFs, setHaltSession]
  );

  useEffect(() => clearTimer, []);

  return (
    <StyledSidebar
      ref={sidebarRef}
      className={collapsed ? "collapsed" : undefined}
      onClick={({ target }) => {
        clearTimer();

        if (
          target instanceof HTMLElement &&
          ((target === sidebarRef.current && collapsed) ||
            (sidebarRef.current?.contains(target) &&
              target.textContent === "START"))
        ) {
          setCollapsed((collapsedState) => !collapsedState);
        }
      }}
      onContextMenu={haltEvent}
      onMouseEnter={() => {
        expandTimer.current = window.setTimeout(() => setCollapsed(false), 700);
      }}
      onMouseLeave={() => {
        clearTimer();
        setCollapsed(true);
      }}
      style={{ height }}
    >
      <SidebarGroup sidebarButtons={topButtons} />
      <SidebarGroup sidebarButtons={bottomButtons} />
    </StyledSidebar>
  );
};

export default memo(Sidebar);
