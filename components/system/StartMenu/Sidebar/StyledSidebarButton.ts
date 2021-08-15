import StyledSidebar from "components/system/StartMenu/Sidebar/StyledSidebar";
import styled from "styled-components";

type StyledSidebarButtonProps = {
  active?: boolean;
};

const StyledSidebarButton = styled.li<StyledSidebarButtonProps>`
  border: 1px solid transparent;
  display: flex;
  height: ${({ theme }) => theme.sizes.startMenu.sideBar.height};
  place-content: center;
  place-items: center;
  width: ${({ theme }) => theme.sizes.startMenu.sideBar.width};

  &::before {
    border-left: ${({ active, theme }) =>
      `4px solid ${active ? theme.colors.highlight : "transparent"}`};
    content: "";
    height: ${({ theme }) => theme.sizes.startMenu.sideBar.height};
    left: 0;
    position: absolute;
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.width};
  }

  figure {
    color: ${({ active, theme }) =>
      active ? theme.colors.highlight : theme.colors.text};
    display: flex;
    place-items: center;

    svg {
      fill: ${({ active, theme }) =>
        active ? theme.colors.highlight : theme.colors.text};
      height: ${({ theme }) => theme.sizes.startMenu.sideBar.iconSize};
      left: ${({ theme }) => theme.sizes.startMenu.sideBar.iconSize};
      margin-left: 1px;
      position: absolute;
      width: ${({ theme }) => theme.sizes.startMenu.sideBar.iconSize};
    }

    figcaption {
      border: 1px solid transparent;
      left: ${({ theme }) => theme.sizes.startMenu.sideBar.width};
      position: absolute;
      white-space: nowrap;

      strong {
        font-weight: 600;
      }
    }
  }

  ${StyledSidebar}:hover & {
    transition: width 300ms 700ms;
    transition-timing-function: cubic-bezier(0.15, 1, 0.5, 1);
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.expandedWidth};
  }

  &:hover {
    background-color: hsla(0, 0%, 35%, 70%);
    border: 1px solid hsla(0, 0%, 45%, 70%);
  }
`;

export default StyledSidebarButton;
