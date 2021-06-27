import styled from "styled-components";

const StyledFileEntry = styled.li`
  figure {
    border: 1px solid transparent;
    display: flex;
    height: 36px;
    padding-bottom: 1px;
    place-items: center;

    &:hover {
      background-color: hsla(0, 0%, 35%, 70%);
      border: 1px solid hsla(0, 0%, 45%, 70%);
    }

    img {
      margin-left: 3px;
      margin-right: 8px;
    }

    figcaption {
      color: #fff;
    }
  }
`;

export default StyledFileEntry;
