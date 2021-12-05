import styled from "styled-components";

const StyledPDF = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  overflow: auto;

  ol {
    position: absolute;
    top: 0;

    canvas {
      box-shadow: 0 0 5px hsla(0, 0%, 10%, 50%);
      margin: 4px 0;
    }
  }
`;

export default StyledPDF;
