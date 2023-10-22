import styled from "styled-components";

const StyledSendMessage = styled.div`
  display: flex;
  place-items: center;

  textarea {
    background-color: #3c3836;
    border-radius: 20px;
    color: #fbf1c7;
    font-family: ${({ theme }) => theme.formats.systemFont};
    font-size: 14px;
    height: 35px;
    margin: 12px 0 12px 12px;
    overflow: hidden;
    padding: 8px 14px 4px;
    resize: none;
    width: 100%;

    &:disabled {
      &::placeholder {
        color: rgba(146, 131, 116, 75%);
      }
    }
  }

  svg {
    cursor: pointer;
    fill: #458588;
    height: 28px;
    margin: 2px 12px 0 10px;
    width: 28px;

    path {
      cursor: pointer;
    }

    &:hover {
      fill: rgb(131, 165, 152, 75%);
    }
  }

  button {
    width: unset;

    &:disabled {
      svg {
        fill: #32302f;
      }
    }
  }
`;

export default StyledSendMessage;
