import styled from "styled-components";

const StyledSendMessage = styled.div`
  display: flex;
  place-items: center;

  input {
    background-color: #3a3b3c;
    border-radius: 20px;
    color: #b0b3b8;
    font-size: 14px;
    height: 35px;
    margin: 12px 0 12px 12px;
    padding: 6px 12px;
    width: 100%;

    &:disabled {
      &::placeholder {
        color: rgba(117, 117, 117, 75%);
      }
    }
  }

  svg {
    fill: #0084ff;
    height: 28px;
    margin: 2px 12px 0 10px;
    width: 28px;

    &:hover {
      fill: rgb(0, 132, 255, 75%);
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
