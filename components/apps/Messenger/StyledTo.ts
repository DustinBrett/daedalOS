import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledTo = styled.div`
  border-bottom: 1px solid rgb(57 58 59);

  input {
    background-color: #242526;
    color: #fff;
    padding: 15px;
    width: 100%;
  }

  [role="status"] {
    color: #b0b3b8;
    font-size: 12px;
    padding: 0 15px 12px;
    user-select: text;
  }

  ol {
    ${ScrollBars()}
    max-height: 264px;
    overflow-y: auto;
    padding-bottom: 6px;

    li {
      border-radius: 8px;
      margin: 0 6px;

      &:hover {
        background-color: #3a3b3c;
      }

      button {
        cursor: pointer;
        padding: 6px 9px;
      }

      figure {
        display: flex;
        gap: 10px;
        place-items: center;

        img,
        svg {
          border-radius: 50%;
          height: 32px;
          min-width: 32px;
          width: 32px;
        }

        figcaption {
          color: #e4e6eb;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
`;

export default StyledTo;
