import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledChatLog = styled.ol`
  ${ScrollBars()}
  height: 100%;
  overflow-x: auto;
  scrollbar-gutter: auto;

  li:not(:first-child) {
    border-radius: 15px;
    color: #fff;
    list-style: none;
    margin: 12px;
    padding: 10px 12px;
    position: relative;

    .status {
      bottom: -4px;
      position: absolute;
      right: -15px;

      svg {
        fill: #ced7e0;
        height: 12px;
        width: 12px;
      }
    }

    &.sent {
      background-color: #0084ff;
      margin-left: 65px;
      margin-right: 20px;
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
        font-weight: 600;
        left: 0;
        position: absolute;
        text-align: center;
        top: -28px;
        width: 100%;
      }

      &.sent {
        &::before {
          margin-left: -65px;
          margin-right: -12px;
          width: calc(100% + 65px + 12px);
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
      cursor: auto;
      overflow: hidden;
      overflow-wrap: break-word;
      user-select: text;

      img {
        border-radius: 5px;
        margin: 6px 0;
        object-fit: unset;
        width: 100%;
      }

      &.avatar {
        bottom: -24px;
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

      &::after {
        content: "🔐";
        font-size: 12px;
        left: 6px;
        margin-left: 0 !important;
        position: absolute;
        text-align: right;
        top: -4px;
        width: 100% !important;
      }
    }
  }
`;

export default StyledChatLog;
