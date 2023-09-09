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
    padding: 12px;
    position: relative;

    div {
      overflow: hidden;
      word-wrap: break-word;

      img {
        border-radius: 5px;
        margin: 6px 0;
        object-fit: unset;
        width: 100%;
      }

      &.avatar {
        bottom: -22px;
        left: -30px;
        position: absolute;

        img,
        svg {
          aspect-ratio: 1/1;
          border-radius: 50%;
          bottom: 5px;
          height: 22px;
          margin: 15px 0;
          max-height: 22px;
          max-width: 22px;
          min-height: 22px;
          min-width: 22px;
          position: relative;
          width: 22px;
        }
      }
    }

    &.sent {
      background-color: #0084ff;
      margin-left: 50px;
    }

    &.received {
      background-color: #3e4042;
      margin-left: 40px;
      margin-right: 50px;
    }

    &.cant-decrypt {
      background-color: #910000;
      position: relative;

      &::before {
        content: "🔐";
        position: absolute;
        right: -8px;
        scale: 0.75;
        top: -6px;
      }
    }
  }
`;

export default StyledChatLog;
