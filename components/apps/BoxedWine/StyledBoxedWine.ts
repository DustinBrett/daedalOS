import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledBoxedWine = styled.div`
  canvas[style*="cursor: none;"] {
    cursor: default !important;
  }

  canvas {
    height: 100%;
    width: 100%;
  }

  ol {
    ${ScrollBars()};
    background-color: rgb(32 33 36);
    color: rgb(232 234 237);
    font-family: "Lucida Grande", sans-serif, monospace;
    font-size: 13px;
    height: 100%;
    line-height: 19px;
    overflow: hidden scroll;
    width: 100%;

    li {
      border-bottom: 1px solid rgb(58 58 58);
      padding: 0 25px;

      &:last-child {
        border-bottom: 0;
      }
    }
  }
`;

export default StyledBoxedWine;
