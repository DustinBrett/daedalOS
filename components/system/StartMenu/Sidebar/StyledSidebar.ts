import styled from "styled-components";

const StyledSidebar = styled.nav`
  display: flex;
  flex-direction: column;
  height: ${({ theme }) => theme.sizes.startMenu.height};
  justify-content: space-between;
  margin-right: 7px;
  margin-top: 4px;
`;

export default StyledSidebar;
