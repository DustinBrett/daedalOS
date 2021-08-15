import styled from "styled-components";

const StyledSidebar = styled.nav`
  display: flex;
  flex-direction: column;
  height: ${({ theme }) => theme.sizes.startMenu.size};
  justify-content: space-between;
  margin-right: 7px;
  overflow: hidden;
  padding-top: 4px;
  position: absolute;
  top: 0;
  transition-duration: 150ms;
  width: ${({ theme }) => theme.sizes.startMenu.sideBar.width};

  &:hover {
    backdrop-filter: blur(10px);
    background-color: hsla(0, 0%, 10%, 75%);
    box-shadow: 8px 0 5px -5px hsla(0, 0%, 10%, 50%);
    transition: all 300ms 700ms;
    transition-timing-function: cubic-bezier(0.15, 1, 0.5, 1);
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.expandedWidth};
  }
`;

export default StyledSidebar;
