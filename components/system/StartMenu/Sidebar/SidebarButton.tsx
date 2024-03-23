import { useCallback } from "react";
import StyledSidebarButton from "components/system/StartMenu/Sidebar/StyledSidebarButton";
import { spotlightEffect } from "utils/spotlightEffect";
import { useFinePointer } from "hooks/useFinePointer";

type SidebarButton = {
  action?: () => void;
  active?: boolean;
  heading?: boolean;
  icon: React.JSX.Element;
  name: string;
  tooltip?: string;
};

export type SidebarButtons = SidebarButton[];

const SidebarButtonComponent: FC<SidebarButton> = ({
  action,
  active,
  heading,
  icon,
  name,
  tooltip,
}) => {
  const hasFinePointer = useFinePointer();

  return (
    <StyledSidebarButton
      ref={useCallback(
        (buttonRef: HTMLLIElement) => {
          if (hasFinePointer) spotlightEffect(buttonRef, true);
        },
        [hasFinePointer]
      )}
      $active={active}
      aria-label={name}
      onClick={action}
      title={tooltip}
    >
      <figure>
        {icon}
        <figcaption>{heading ? <strong>{name}</strong> : name}</figcaption>
      </figure>
    </StyledSidebarButton>
  );
};

export default SidebarButtonComponent;
