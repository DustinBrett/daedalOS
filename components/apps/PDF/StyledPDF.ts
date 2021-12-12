import StyledWindow from "components/system/Window/StyledWindow";
import styled from "styled-components";

const StyledPDF = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  overflow: auto;
  position: relative;
  top: 40px;

  ${StyledWindow} & {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.titleBar.height} - 40px) !important`};
  }

  canvas {
    box-shadow: 0 0 5px hsla(0, 0%, 10%, 50%);
    margin: 4px 0;
  }
`;

export default StyledPDF;
