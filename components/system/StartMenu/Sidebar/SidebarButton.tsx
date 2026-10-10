import StyledSidebarButton from "components/system/StartMenu/Sidebar/StyledSidebarButton";
import { hasFinePointer } from "utils/functions";
import { spotlightEffect } from "utils/spotlightEffect";

type SidebarButton = {
  action?: () => void;
  active?: boolean;
  expanded?: boolean;
  heading?: boolean;
  icon: React.JSX.Element;
  name: string;
  tooltip?: string;
};

export type SidebarButtons = SidebarButton[];

const SidebarButtonComponent: FC<SidebarButton> = ({
  action,
  active,
  expanded,
  heading,
  icon,
  name,
  tooltip,
}) => (
  <li>
    <StyledSidebarButton
      ref={(buttonRef: HTMLButtonElement) => {
        if (hasFinePointer()) spotlightEffect(buttonRef, true);
      }}
      $active={active}
      aria-expanded={expanded}
      aria-label={name}
      onClick={action}
      title={tooltip}
    >
      <figure>
        {icon}
        <figcaption>{heading ? <strong>{name}</strong> : name}</figcaption>
      </figure>
    </StyledSidebarButton>
  </li>
);

export default SidebarButtonComponent;
