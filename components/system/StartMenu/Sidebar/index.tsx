import {
  AllApps,
  Documents,
  Power,
  SideMenu,
} from "components/system/StartMenu/Sidebar/SidebarIcons";
import StyledSidebar from "components/system/StartMenu/Sidebar/StyledSidebar";
import StyledSidebarButton from "components/system/StartMenu/Sidebar/StyledSidebarButton";
import { useFileSystem } from "contexts/fileSystem";

type SidebarButtonProps = {
  action?: () => void;
  active?: boolean;
  heading?: boolean;
  icon: JSX.Element;
  name: string;
};

const topButtons = [
  { name: "START", icon: <SideMenu />, heading: true },
  { name: "All apps", icon: <AllApps />, active: true },
];

const SidebarButton = ({
  action,
  active,
  heading,
  icon,
  name,
}: SidebarButtonProps) => (
  <StyledSidebarButton active={active} onClick={action}>
    <figure>
      {icon}
      <figcaption>{heading ? <strong>{name}</strong> : name}</figcaption>
    </figure>
  </StyledSidebarButton>
);

const Sidebar = (): JSX.Element => {
  const fs = useFileSystem();
  const bottomButtons = [
    { name: "Documents", icon: <Documents /> },
    {
      name: "Power",
      icon: <Power />,
      action: () => fs?.resetFs().finally(() => window.location.reload()),
    },
  ];

  return (
    <StyledSidebar>
      {Object.entries({ topButtons, bottomButtons }).map(([key, buttons]) => (
        <ol key={key}>
          {buttons.map((button) => (
            <SidebarButton key={button.name} {...button} />
          ))}
        </ol>
      ))}
    </StyledSidebar>
  );
};

export default Sidebar;
