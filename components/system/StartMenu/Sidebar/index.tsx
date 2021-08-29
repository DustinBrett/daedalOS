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
import { useRef, useState } from "react";

const Sidebar = (): JSX.Element => {
  const { resetFs } = useFileSystem();
  const { open } = useProcesses();
  const [collapsed, setCollapsed] = useState(true);
  const expandTimer = useRef<NodeJS.Timer>();
  const topButtons: SidebarButtons = [
    {
      name: "START",
      icon: <SideMenu />,
      tooltip: "Expand",
      heading: true,
      action: () => setCollapsed((collapsedState) => !collapsedState),
    },
    { name: "All apps", icon: <AllApps />, active: true },
  ];
  const bottomButtons: SidebarButtons = [
    {
      name: "Documents",
      icon: <Documents />,
      action: () => open("FileExplorer", "/documents"),
    },
    {
      name: "Power",
      icon: <Power />,
      action: () => resetFs().finally(() => window.location.reload()),
    },
  ];

  return (
    <StyledSidebar
      className={collapsed ? "collapsed" : undefined}
      onMouseEnter={() => {
        expandTimer.current = setTimeout(() => setCollapsed(false), 700);
      }}
      onMouseLeave={() => {
        if (expandTimer.current) clearTimeout(expandTimer.current);
        setCollapsed(true);
      }}
    >
      {Object.entries({ topButtons, bottomButtons }).map(([key, buttons]) => (
        <ol key={key}>
          {buttons.map((button) => (
            <SidebarButton
              key={button.name}
              collapsed={collapsed}
              {...button}
            />
          ))}
        </ol>
      ))}
    </StyledSidebar>
  );
};

export default Sidebar;
