import StyledButton from "components/system/Dialogs/Transfer/StyledButton";
import styled from "styled-components";

const StyledTransfer = styled.div`
  h1,
  div {
    align-items: baseline;
    display: flex;
    flex-direction: column;
    height: calc(100% - 40px - 41px - 2px);
    justify-content: space-around;
    padding: 0 22px;

    progress {
      border: 1px solid rgb(188, 188, 188);
      height: 15px;
      width: 100%;

      &::-webkit-progress-bar {
        background-color: rgb(230, 230, 230);
      }

      &::-webkit-progress-value {
        background: rgb(6, 176, 37);
      }

      &::-moz-progress-bar {
        background: rgb(6, 176, 37);
      }
    }
  }

  div {
    margin-top: -3px;
  }

  h1 {
    background: linear-gradient(
      to right,
      rgb(220, 229, 244),
      rgb(155, 192, 227),
      rgb(0, 43, 85)
    );
    display: flex;
    font-size: 15px;
    font-weight: 400;
    height: 40px;
    place-items: flex-start;
    white-space: nowrap;
    width: 100%;
  }

  h2 {
    font-size: 12px;
    font-weight: 400;
  }

  nav {
    background-color: rgb(240, 240, 240);
    border-top: 1px solid rgb(223, 223, 223);
    bottom: 0;
    box-sizing: content-box;
    display: flex;
    height: 41px;
    padding-bottom: 1px;
    place-items: center;
    position: absolute;
    width: 100%;

    ${StyledButton} {
      padding-bottom: 1px;
      position: absolute;
      right: 23px;
    }
  }
`;

export default StyledTransfer;
