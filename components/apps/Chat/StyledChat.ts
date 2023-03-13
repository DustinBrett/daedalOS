import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

const SHADOW = "0 0.5px 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)";

type StyledChatProps = {
  $hideSend: boolean;
};

const StyledChat = styled.div<StyledChatProps>`
  background-color: rgb(68, 70, 84);
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  div {
    align-items: flex-end;
    background-color: rgb(52, 53, 65);
    bottom: 0;
    display: flex;
    left: 0;
    position: absolute;
    right: ${DEFAULT_SCROLLBAR_WIDTH}px;

    textarea {
      background-color: rgb(64, 65, 79);
      border: 5px solid rgb(64, 65, 79);
      border-radius: 24px;
      box-shadow: ${SHADOW};
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

      ::placeholder {
        color: rgb(200, 200, 200);
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
  }

  ul {
    ${ScrollBars(DEFAULT_SCROLLBAR_WIDTH)};

    height: 100%;
    overflow-y: scroll;
    padding-bottom: 84px;
    position: relative;

    li {
      box-shadow: ${SHADOW};
      border-radius: 18px;
      font-size: 16px;
      line-height: 20px;
      margin: 20px;
      max-width: calc(100% - 40px);
      overflow-wrap: break-word;
      padding: 10px 15px;
      width: max-content;

      &.bot {
        background: linear-gradient(
          90deg,
          rgb(248, 249, 253),
          rgb(245, 248, 253)
        );
        color: #000;
        margin-left: 56px;
        margin-right: auto;
        max-width: calc(100% - 78px);
        position: relative;

        &::before {
          background-color: black;
          background-image: url("/favicon.ico");
          background-size: contain;
          border-radius: 50%;
          content: "";
          height: 31px;
          left: -40px;
          position: absolute;
          top: 9px;
          width: 31px;
        }
      }

      &.user {
        background: linear-gradient(90deg, rgb(40, 112, 234), rgb(27, 74, 239));
        color: #fff;
        margin-left: auto;
      }
    }

    .user + .user {
      margin-top: -18px;
    }
  }
`;

export default StyledChat;
