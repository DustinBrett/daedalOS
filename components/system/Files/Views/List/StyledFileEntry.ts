import styled from "styled-components";
import { THIN_SCROLLBAR_WIDTH } from "utils/constants";

const StyledFileEntry = styled.li`
  figure {
    border: 1px solid transparent;
    display: flex;
    height: 36px;
    padding-bottom: 1px;
    place-items: center;
    width: calc(100% - ${THIN_SCROLLBAR_WIDTH}px);

    figcaption {
      color: #fff;
    }

    img {
      margin-left: 3px;
      margin-right: 8px;
    }

    &:active {
      figcaption {
        letter-spacing: -0.15px;
        opacity: 0.9;
      }

      img {
        margin-left: 7px;
      }
    }

    &:hover {
      background-color: hsla(0, 0%, 35%, 70%);
      border: 1px solid hsla(0, 0%, 45%, 70%);
    }
  }
`;

export default StyledFileEntry;
