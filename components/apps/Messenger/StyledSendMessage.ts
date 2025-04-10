import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledSendMessage = styled.div`
  display: flex;
  place-items: center;

  textarea {
    ${ScrollBars()}
    background-color: #3a3b3c;
    border-radius: 20px;
    color: #b0b3b8;
    font-family: ${({ theme }) => theme.formats.systemFont};
    font-size: 14px;
    height: 35px;
    margin: 12px 0 12px 12px;
    max-height: 150px;
    overflow: hidden auto;
    padding: 8px 14px 4px;
    resize: none;
    width: 100%;

    &:disabled {
      &::placeholder {
        color: rgb(117 117 117 / 75%);
      }
    }
  }

  svg {
    cursor: pointer;
    fill: #0084ff;
    height: 28px;
    margin: 2px 12px 0 10px;
    width: 28px;

    path {
      cursor: pointer;
    }

    &:hover {
      fill: rgb(0 132 255 / 75%);
    }
  }

  button {
    width: unset;

    &:disabled {
      svg {
        fill: #3a3b3c;
      }
    }
  }
`;

export default StyledSendMessage;
