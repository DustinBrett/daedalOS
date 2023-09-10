import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledChatLog = styled.ol`
  ${ScrollBars()}
  height: 100%;
  overflow-x: auto;

  li {
    border-radius: 15px;
    color: #fff;
    list-style: none;
    margin: 12px;
    padding: 12px;
    position: relative;

    &.sent {
      background-color: #0084ff;
      margin-left: 65px;
    }

    &.received {
      background-color: #3e4042;
      margin-left: 40px;
      margin-right: 50px;
    }

    &[data-timestamp] {
      margin-top: 50px;

      &:nth-child(2) {
        margin-top: 30px;
      }

      &::before {
        color: #8b8d92;
        content: attr(data-timestamp);
        font-size: 11px;
        font-weight: 700;
        left: 0;
        position: absolute;
        text-align: center;
        top: -28px;
        width: 100%;
      }

      &.sent {
        &::before {
          margin-left: -65px;
          width: calc(100% + 65px);
        }
      }

      &.received {
        &::before {
          margin-left: -40px;
          margin-right: -50px;
          width: calc(100% + 90px);
        }
      }
    }

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
