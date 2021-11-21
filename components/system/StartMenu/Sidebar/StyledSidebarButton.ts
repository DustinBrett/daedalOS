import StyledSidebar from "components/system/StartMenu/Sidebar/StyledSidebar";
import styled from "styled-components";

type StyledSidebarButtonProps = {
  $active?: boolean;
};

const StyledSidebarButton = styled.li<StyledSidebarButtonProps>`
  display: flex;
  width: ${({ theme }) => theme.sizes.startMenu.sideBar.width};
  height: ${({ theme }) => theme.sizes.startMenu.sideBar.height};
  border: 1px solid transparent;
  place-content: center;
  place-items: center;
  transition-duration: 150ms;

  &::before {
    position: absolute;
    left: 0;
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.width};
    height: ${({ theme }) => theme.sizes.startMenu.sideBar.height};
    border-left: ${({ $active, theme }) =>
      `4px solid ${$active ? theme.colors.highlight : "transparent"}`};
    content: "";
  }

  figure {
    display: flex;
    color: ${({ $active, theme }) =>
      $active ? theme.colors.highlight : theme.colors.text};
    place-items: center;

    svg {
      position: absolute;
      left: ${({ theme }) => theme.sizes.startMenu.sideBar.iconSize};
      width: ${({ theme }) => theme.sizes.startMenu.sideBar.iconSize};
      height: ${({ theme }) => theme.sizes.startMenu.sideBar.iconSize};
      margin-left: 1px;
      fill: ${({ $active, theme }) =>
        $active ? theme.colors.highlight : theme.colors.text};
    }

    figcaption {
      position: absolute;
      left: ${({ theme }) => theme.sizes.startMenu.sideBar.width};
      border: 1px solid transparent;
      white-space: nowrap;

      strong {
        font-weight: 600;
      }
    }
  }

  ${StyledSidebar}:hover:not(${StyledSidebar}.collapsed) & {
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.expandedWidth};
    transition: width 300ms;
    transition-timing-function: cubic-bezier(0.15, 1, 0.5, 1);
  }

  &:hover {
    border: 1px solid hsla(0, 0%, 45%, 70%);
    background-color: hsla(0, 0%, 35%, 70%);
  }

  &:active {
    background-color: hsla(0, 0%, 40%, 70%);
  }
`;

export default StyledSidebarButton;
