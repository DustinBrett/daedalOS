import StyledSidebarButton from "components/system/StartMenu/Sidebar/StyledSidebarButton";

export type SidebarButtonType = {
  action?: () => void;
  active?: boolean;
  heading?: boolean;
  icon: JSX.Element;
  name: string;
  tooltip?: string;
};

type SidebarButtonProps = SidebarButtonType & { collapsed: boolean };

const SidebarButton = ({
  action,
  active,
  collapsed,
  heading,
  icon,
  name,
  tooltip,
}: SidebarButtonProps): JSX.Element => (
  <StyledSidebarButton
    active={active}
    onClick={action}
    title={collapsed ? tooltip || name : undefined}
  >
    <figure>
      {icon}
      <figcaption>{heading ? <strong>{name}</strong> : name}</figcaption>
    </figure>
  </StyledSidebarButton>
);

export default SidebarButton;
