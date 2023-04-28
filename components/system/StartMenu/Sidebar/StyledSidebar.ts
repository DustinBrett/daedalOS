import styled from "styled-components";

const StyledSidebar = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  margin-right: 7px;
  overflow: hidden;
  padding-top: 4px;
  position: absolute;
  top: 0;
  transition-duration: 150ms;
  width: ${({ theme }) => theme.sizes.startMenu.sideBar.width}px;
  z-index: 1;

  &:hover:not(&.collapsed) {
    backdrop-filter: blur(12px);
    background-color: hsla(0, 0%, 10%, 95%);
    box-shadow: 8px 0 5px -5px hsla(0, 0%, 10%, 50%);
    transition: all 300ms ease, backdrop-filter 1ms;
    transition-timing-function: cubic-bezier(0.15, 1, 0.5, 1);
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.expandedWidth};

    @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
      background-color: hsla(0, 0%, 10%, 75%);
    }
  }
`;

export default StyledSidebar;
