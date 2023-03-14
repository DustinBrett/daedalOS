import { BOX_SHADOW } from "components/apps/Chat/config";
import styled, { css } from "styled-components";

type StyledMessageProps = {
  $type: string;
  $writing?: boolean;
};

const StyledMessage = styled.li<StyledMessageProps>`
  box-shadow: ${BOX_SHADOW};
  border-radius: 18px;
  cursor: text;
  font-size: 16px;
  line-height: 20px;
  margin: 20px;
  max-width: calc(100% - 40px);
  overflow-wrap: break-word;
  padding: 10px 15px;
  user-select: text;
  width: max-content;

  ${({ $writing }) =>
    $writing &&
    css`
      &::after {
        content: "";
        border-left: 1px solid #000;
      }
    `}

  ${({ $type }) =>
    $type === "assistant" &&
    css`
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
    `}

  ${({ $type }) =>
    $type === "user" &&
    css`
      background: linear-gradient(90deg, rgb(40, 112, 234), rgb(27, 74, 239));
      color: #fff;
      margin-left: auto;
    `}
`;

export default StyledMessage;
