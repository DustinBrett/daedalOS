import styled from "styled-components";

const StyledPaint = styled.div`
  iframe {
    transition: opacity 0.25s ease-in;
  }

  .loading {
    &::before {
      color: #fff;
      font-weight: 500;
      mix-blend-mode: normal;
      text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
    }
  }
`;

export default StyledPaint;
