import styled from "styled-components";

const StyledRuffle = styled.div`
  height: ${({ theme }) =>
    `calc(100% - ${theme.sizes.titleBar.height}) !important`};
  width: 100%;

  ruffle-player {
    height: 100%;
    width: 100%;
  }
`;

export default StyledRuffle;
