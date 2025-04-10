import styled from "styled-components";
import Message from "styles/common/Message";
import ScrollBars from "styles/common/ScrollBars";

const StyledPDF = styled.div`
  ${ScrollBars()};

  contain: strict;
  display: block;
  overflow: auto;
  position: relative;
  text-align: center;
  top: 40px;

  && {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.titleBar.height}px - 40px)`};
  }

  canvas {
    box-shadow: 0 0 5px hsl(0 0% 10% / 50%);
    margin: 4px 4px 0;
  }

  &.drop {
    ${Message("Drop PDF file here", "#fff")};
  }
`;

export default StyledPDF;
