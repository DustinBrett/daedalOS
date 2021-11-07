import StyledSidebarButton from "components/system/StartMenu/Sidebar/StyledSidebarButton";

type SidebarButton = {
  action?: () => void;
  active?: boolean;
  heading?: boolean;
  icon: JSX.Element;
  name: string;
  tooltip?: string;
};

export type SidebarButtons = SidebarButton[];

type SidebarButtonProps = SidebarButton & { collapsed: boolean };

const SidebarButtonComponent = ({
  action,
  active,
  collapsed,
  heading,
  icon,
  name,
  tooltip,
}: SidebarButtonProps): JSX.Element => (
  <StyledSidebarButton
    $active={active}
    onClick={action}
    title={collapsed ? tooltip || name : undefined}
  >
    <figure>
      {icon}
      <figcaption>{heading ? <strong>{name}</strong> : name}</figcaption>
    </figure>
  </StyledSidebarButton>
);

export default SidebarButtonComponent;
