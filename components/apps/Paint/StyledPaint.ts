import styled from "styled-components";

type StyledPaintProps = {
  $loaded: boolean;
};

const StyledPaint = styled.div<StyledPaintProps>`
  iframe {
    opacity: ${({ $loaded }) => ($loaded ? "100%" : "0%")};
    transition: opacity 0.25s ease-in;
  }

  .loading {
    &::before {
      color: #fff;
      font-weight: 500;
      mix-blend-mode: normal;
      text-shadow: 1px 2px 3px rgb(0 0 0 / 50%);
    }
  }
`;

export default StyledPaint;
