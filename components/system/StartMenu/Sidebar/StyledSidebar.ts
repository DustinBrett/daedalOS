import styled from "styled-components";

const StyledSidebar = styled.nav`
  display: flex;
  flex-direction: column;
  height: ${({ theme }) => theme.sizes.startMenu.size};
  justify-content: space-between;
  margin-right: 7px;
  padding-top: 4px;
  position: absolute;
  top: 0;
`;

export default StyledSidebar;
