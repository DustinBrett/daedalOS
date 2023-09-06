import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledChatLog = styled.ol`
  ${ScrollBars()}
  height: 100%;
  overflow-x: auto;

  li {
    border-radius: 18px;
    color: #fff;
    list-style: none;
    margin: 12px;
    overflow: hidden;
    padding: 12px;
    position: relative;

    &.sent {
      background-color: #0084ff;
      margin-left: 50px;
    }

    &.received {
      background-color: #3e4042;
      margin-right: 50px;
    }
  }
`;

export default StyledChatLog;
