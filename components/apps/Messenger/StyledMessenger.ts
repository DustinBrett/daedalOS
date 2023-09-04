import styled from "styled-components";

const StyledMessenger = styled.ol`
  background-color: #242526;

  li {
    border-radius: 18px;
    color: #fff;
    margin: 12px;
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

    span {
      border-radius: 18px;
      font-size: 9px;
      padding: 3px 6px;

      &:first-child {
        background-color: grey;
        bottom: -6px;
        position: absolute;
        right: -6px;
      }

      &:nth-child(2) {
        background-color: grey;
        left: -6px;
        position: absolute;
        top: -6px;
      }
    }
  }
`;

export default StyledMessenger;
