import { BOX_SHADOW } from "components/apps/Chat/config";
import styled, { css } from "styled-components";

type StyledMessageProps = {
  $image?: string;
  $isCommand?: boolean;
  $type: string;
  $writing?: boolean;
};

const MAX_IMAGE_SIZE = 256;

const StyledMessage = styled.li<StyledMessageProps>`
  background-size: cover;
  border-radius: 18px;
  box-shadow: ${BOX_SHADOW};
  cursor: ${({ $image }) => ($image ? undefined : "text")};
  font-size: 16px;
  height: ${({ $image }) => ($image ? `${MAX_IMAGE_SIZE}px` : undefined)};
  line-height: 20px;
  margin: 20px;
  max-width: calc(100% - 40px);
  overflow-wrap: break-word;
  padding: 10px 15px;
  user-select: text;
  white-space: break-spaces;
  width: ${({ $image }) => ($image ? `${MAX_IMAGE_SIZE}px` : "max-content")};

  ${({ $image, $type }) =>
    $type === "assistant" &&
    css`
      background: ${$image
        ? `url(${$image})`
        : "linear-gradient(90deg, rgb(248, 249, 253), rgb(245, 248, 253))"};
      background-size: contain;
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

      .cursor {
        display: contents;
        font-size: 14px;
      }

      > span {
        cursor: text;
        display: flex;
        flex-direction: column;
        gap: 10px;
        user-select: text;

        code {
          background-color: rgb(25, 25, 25);
          border-radius: 6px;
          color: rgb(250, 250, 250);
          cursor: text;
          font-size: 12px;
          padding: 2px 5px;
          user-select: text;
        }

        p {
          cursor: text;
          user-select: text;
        }

        pre > code {
          display: block;
          font-size: 14px;
          padding: 10px;
          white-space: pre-wrap;
        }

        ol,
        ul {
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: auto;
          user-select: text;

          li {
            user-select: text;
          }
        }
      }
    `}

  ${({ $isCommand, $type }) =>
    $type === "user" &&
    css`
      background: linear-gradient(
        90deg,
        ${$isCommand ? "rgb(224, 40, 234)" : "rgb(40, 112, 234)"},
        ${$isCommand ? "rgb(148, 27, 239)" : "rgb(27, 74, 239)"}
      );
      color: #fff;
      margin-left: auto;
    `}
`;

export default StyledMessage;
