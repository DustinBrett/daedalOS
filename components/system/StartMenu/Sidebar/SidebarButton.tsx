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

const SidebarButtonComponent = ({
  action,
  active,
  heading,
  icon,
  name,
  tooltip,
}: SidebarButton): JSX.Element => (
  <StyledSidebarButton $active={active} onClick={action} title={tooltip}>
    <figure>
      {icon}
      <figcaption>{heading ? <strong>{name}</strong> : name}</figcaption>
    </figure>
  </StyledSidebarButton>
);

export default SidebarButtonComponent;
