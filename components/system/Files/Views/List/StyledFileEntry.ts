import styled from "styled-components";

const StyledFileEntry = styled.li`
  figure {
    display: flex;
    height: 36px;
    padding-bottom: 1px;
    border: 1px solid transparent;
    place-items: center;

    figcaption {
      color: #fff;
    }

    img {
      margin-right: 8px;
      margin-left: 3px;
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
      border: 1px solid hsla(0, 0%, 45%, 70%);
      background-color: hsla(0, 0%, 35%, 70%);
    }
  }
`;

export default StyledFileEntry;
