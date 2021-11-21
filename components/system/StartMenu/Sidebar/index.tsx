import type { SidebarButtons } from "components/system/StartMenu/Sidebar/SidebarButton";
import SidebarButton from "components/system/StartMenu/Sidebar/SidebarButton";
import {
  AllApps,
  Documents,
  Power,
  SideMenu,
} from "components/system/StartMenu/Sidebar/SidebarIcons";
import StyledSidebar from "components/system/StartMenu/Sidebar/StyledSidebar";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useEffect, useRef, useState } from "react";
import { HOME } from "utils/constants";

type SidebarGroupProps = {
  collapsed: boolean;
  sidebarButtons: SidebarButtons;
};

const SidebarGroup = ({
  collapsed,
  sidebarButtons,
}: SidebarGroupProps): JSX.Element => (
  <ol>
    {sidebarButtons.map((button) => (
      <SidebarButton key={button.name} collapsed={collapsed} {...button} />
    ))}
  </ol>
);

const Sidebar = (): JSX.Element => {
  const { resetFs } = useFileSystem();
  const { open } = useProcesses();
  const [collapsed, setCollapsed] = useState(true);
  const expandTimer = useRef<number>();
  const clearTimer = (): void => {
    if (expandTimer.current) clearTimeout(expandTimer.current);
  };
  const topButtons: SidebarButtons = [
    {
      action: () => setCollapsed((collapsedState) => !collapsedState),
      heading: true,
      icon: <SideMenu />,
      name: "START",
      tooltip: "Expand",
    },
    { active: true, icon: <AllApps />, name: "All apps" },
  ];
  const bottomButtons: SidebarButtons = [
    {
      action: () =>
        open(
          "FileExplorer",
          `${HOME}/Documents`,
          "/System/Icons/documents.png"
        ),
      icon: <Documents />,
      name: "Documents",
    },
    {
      action: () => resetFs().finally(() => window.location.reload()),
      icon: <Power />,
      name: "Power",
      tooltip: "Clears session data and reloads the page.",
    },
  ];

  useEffect(() => clearTimer, []);

  return (
    <StyledSidebar
      className={collapsed ? "collapsed" : undefined}
      onMouseEnter={() => {
        expandTimer.current = window.setTimeout(() => setCollapsed(false), 700);
      }}
      onMouseLeave={() => {
        clearTimer();
        setCollapsed(true);
      }}
    >
      <SidebarGroup collapsed={collapsed} sidebarButtons={topButtons} />
      <SidebarGroup collapsed={collapsed} sidebarButtons={bottomButtons} />
    </StyledSidebar>
  );
};

export default Sidebar;
