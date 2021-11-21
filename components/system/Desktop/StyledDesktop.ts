import styled from "styled-components";

const StyledDesktop = styled.main`
  position: fixed;
  width: 100vw;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  background-position: center;
  contain: strict;
  inset: 0;
`;

export default StyledDesktop;
