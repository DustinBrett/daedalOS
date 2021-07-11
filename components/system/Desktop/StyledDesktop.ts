import styled from "styled-components";

const StyledDesktop = styled.main`
  background-color: ${({ theme }) => theme.colors.background};
  height: 100vh;
  inset: 0;
  position: fixed;
  width: 100vw;
`;

export default StyledDesktop;
