import styled from "styled-components";

const StyledDesktop = styled.main`
  background-color: ${({ theme }) => theme.colors.background};
  background-position: center;
  contain: strict;
  height: 100%;
  inset: 0;
  position: fixed;
  width: 100vw;
`;

export default StyledDesktop;
