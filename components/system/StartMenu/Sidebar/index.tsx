import type { SidebarButtons } from "components/system/StartMenu/Sidebar/SidebarButton";
import SidebarButton from "components/system/StartMenu/Sidebar/SidebarButton";
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
import { useEffect, useRef, useState } from "react";
import { HOME } from "utils/constants";

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
  const { resetStorage } = useFileSystem();
  const { open } = useProcesses();
  const [collapsed, setCollapsed] = useState(true);
  const expandTimer = useRef<number>();
  const clearTimer = (): void => {
    if (expandTimer.current) clearTimeout(expandTimer.current);
  };
  const topButtons: SidebarButtons = [
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
  ];
  const bottomButtons: SidebarButtons = [
    {
      action: () =>
        open(
          "FileExplorer",
          { url: `${HOME}/Documents` },
          "/System/Icons/documents.webp"
        ),
      icon: <Documents />,
      name: "Documents",
      ...(collapsed && { tooltip: "Documents" }),
    },
    {
      action: () =>
        open(
          "FileExplorer",
          { url: `${HOME}/Pictures` },
          "/System/Icons/pictures.webp"
        ),
      icon: <Pictures />,
      name: "Pictures",
      ...(collapsed && { tooltip: "Pictures" }),
    },
    {
      action: () =>
        open(
          "FileExplorer",
          { url: `${HOME}/Videos` },
          "/System/Icons/videos.webp"
        ),
      icon: <Videos />,
      name: "Videos",
      ...(collapsed && { tooltip: "Videos" }),
    },
    {
      action: () => resetStorage().finally(() => window.location.reload()),
      icon: <Power />,
      name: "Power",
      tooltip: "Clears session data and reloads the page.",
    },
  ];

  useEffect(() => clearTimer, []);

  return (
    <StyledSidebar
      className={collapsed ? "collapsed" : undefined}
      onClick={() => {
        clearTimer();
        setCollapsed((collapsedState) => !collapsedState);
      }}
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

export default Sidebar;
