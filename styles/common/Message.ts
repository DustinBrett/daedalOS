import { type RuleSet, css } from "styled-components";

const Message = (text: string, color: string): RuleSet<object> => css`
  &::before {
    color: ${color};
    content: "${text}";
    display: flex;
    font-size: 16px;
    font-weight: 600;
    height: 100%;
    left: 0;
    place-content: center;
    place-items: center;
    position: absolute;
    top: 0;
    width: 100%;
  }
`;

export default Message;
