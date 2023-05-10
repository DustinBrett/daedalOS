import { BOX_SHADOW } from "components/apps/Chat/config";
import styled from "styled-components";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

type StyledInputAreaProps = {
  $hideSend: boolean;
};

const StyledInputArea = styled.div<StyledInputAreaProps>`
  align-items: flex-end;
  background-color: rgb(52, 53, 65);
  bottom: 0;
  display: flex;
  left: 0;
  position: absolute;
  right: ${DEFAULT_SCROLLBAR_WIDTH}px;

  .status {
    background-color: rgb(52, 53, 65);
    border-top-right-radius: 5px;
    color: #fff;
    font-size: 12px;
    line-height: 16px;
    max-width: 95%;
    overflow: hidden;
    padding: 5px 10px;
    position: absolute;
    text-overflow: ellipsis;
    top: -26px;
    white-space: nowrap;
    width: fit-content;
  }

  textarea {
    background-color: rgb(64, 65, 79);
    border: 5px solid rgb(64, 65, 79);
    border-radius: 24px;
    box-shadow: ${BOX_SHADOW};
    color: #fff;
    font-family: ${({ theme }) => theme.formats.systemFont};
    font-size: 16px;
    height: 40px;
    line-height: 20px;
    margin: 22px;
    overflow: hidden;
    padding: 4px 40px 4px 16px;
    resize: none;
    width: 100%;

    &::placeholder {
      color: rgba(200, 200, 200, 75%);
    }
  }

  button {
    bottom: 25px;
    cursor: pointer;
    opacity: ${({ $hideSend }) => ($hideSend ? "0%" : "100%")};
    pointer-events: ${({ $hideSend }) => ($hideSend ? "none" : "all")};
    position: absolute;
    right: 28px;
    transition: opacity 0.1s ease-in-out;
    width: min-content;

    &:hover {
      background-color: rgb(52, 53, 65);
      border-radius: 50%;
    }

    svg {
      color: rgb(0, 132, 255);
      margin: 8px 8px 3px 6px;
      pointer-events: none;
      width: 20px;
    }
  }
`;

export default StyledInputArea;
