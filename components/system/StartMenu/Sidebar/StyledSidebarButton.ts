import styled from "styled-components";
import StyledSidebar from "components/system/StartMenu/Sidebar/StyledSidebar";

type StyledSidebarButtonProps = {
  $active?: boolean;
};

const StyledSidebarButton = styled.li<StyledSidebarButtonProps>`
  border: 1px solid transparent;
  display: flex;
  height: ${({ theme }) => theme.sizes.startMenu.sideBar.buttonHeight}px;
  place-content: center;
  place-items: center;
  transition-duration: 150ms;
  width: ${({ theme }) => theme.sizes.startMenu.sideBar.width}px;

  &::before {
    border-left: ${({ $active, theme }) =>
      `4px solid ${$active ? theme.colors.selectionHighlight : "transparent"}`};
    content: "";
    height: ${({ theme }) => theme.sizes.startMenu.sideBar.buttonHeight}px;
    left: 0;
    position: absolute;
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.width}px;
  }

  figure {
    color: ${({ $active, theme }) =>
      $active ? theme.colors.highlight : theme.colors.text};
    display: flex;
    place-items: center;

    svg {
      fill: ${({ $active, theme }) =>
        $active ? theme.colors.highlight : theme.colors.text};
      height: ${({ theme }) => theme.sizes.startMenu.sideBar.iconSize};
      left: ${({ theme }) => theme.sizes.startMenu.sideBar.iconSize};
      margin-left: 1px;
      pointer-events: none;
      position: absolute;
      width: ${({ theme }) => theme.sizes.startMenu.sideBar.iconSize};
    }

    figcaption {
      border: 1px solid transparent;
      left: ${({ theme }) => theme.sizes.startMenu.sideBar.width}px;
      position: absolute;
      white-space: nowrap;

      strong {
        font-weight: 600;
      }
    }
  }

  ${StyledSidebar}:hover:not(${StyledSidebar}.collapsed) & {
    transition: width 300ms;
    transition-timing-function: cubic-bezier(0.15, 1, 0.5, 1);
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.expandedWidth};
  }

  &:hover {
    background-color: hsl(0 0% 35% / 70%);
    border: 1px solid hsl(0 0% 45% / 70%);
  }

  &:active {
    background-color: hsl(0 0% 40% / 70%);
  }
`;

export default StyledSidebarButton;
