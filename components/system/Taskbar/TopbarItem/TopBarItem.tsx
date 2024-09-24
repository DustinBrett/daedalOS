/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";

interface TopBarItemProps {
  children: React.ReactNode;
  className?: string;
  forceHover?: boolean;
  hideOnMobile?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

const TopBarItem = React.forwardRef<HTMLDivElement, TopBarItemProps>(
  (props, ref) => {
    const {
      children,
      className,
      onClick,
      onMouseEnter,
      hideOnMobile,
      forceHover,
    } = props;

    const hideClass = hideOnMobile ? "hidden sm:inline-flex" : "inline-flex";
    const bgClass = forceHover
      ? "bg-gray-100/30 dark:bg-gray-400/40"
      : "hover:(bg-gray-100/30 dark:bg-gray-400/40)";

    return (
      <div
        ref={ref}
        className={`hstack space-x-1 h-6 px-1 cursor-default rounded ${hideClass} ${bgClass} ${className || ""}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        {children}
      </div>
    );
  }
);

export default TopBarItem;
