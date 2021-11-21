import styled from "styled-components";

const StyledSidebar = styled.nav`
  position: absolute;
  top: 0;
  display: flex;
  overflow: hidden;
  width: ${({ theme }) => theme.sizes.startMenu.sideBar.width};
  height: ${({ theme }) => theme.sizes.startMenu.size};
  flex-direction: column;
  justify-content: space-between;
  padding-top: 4px;
  margin-right: 7px;
  transition-duration: 150ms;

  &:hover:not(&.collapsed) {
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.expandedWidth};
    backdrop-filter: blur(12px);
    background-color: hsla(0, 0%, 10%, 75%);
    box-shadow: 8px 0 5px -5px hsla(0, 0%, 10%, 50%);
    transition: all 300ms;
    transition-timing-function: cubic-bezier(0.15, 1, 0.5, 1);
  }
`;

export default StyledSidebar;
