import styled from "styled-components";
import Button from "styles/common/Button";

const StyledDialog = styled.div`
  h1,
  div {
    display: flex;
    height: calc(100% - 40px - 41px - 2px);
    flex-direction: column;
    align-items: baseline;
    justify-content: space-around;
    padding: 0 22px;

    progress {
      width: 100%;
      height: 15px;
      border: 1px solid rgb(188, 188, 188);

      &::-webkit-progress-bar {
        background-color: rgb(230, 230, 230);
      }

      &::-webkit-progress-value {
        background: rgb(6, 176, 37);
      }
    }
  }

  div {
    margin-top: -3px;
  }

  h1 {
    display: flex;
    width: 100%;
    height: 40px;
    background: linear-gradient(
      to right,
      rgb(220, 229, 244),
      rgb(155, 192, 227),
      rgb(0, 43, 85)
    );
    font-size: 15px;
    font-weight: 400;
    place-items: flex-start;
  }

  h2 {
    font-size: 12px;
    font-weight: 400;
  }

  nav {
    position: absolute;
    bottom: 0;
    display: flex;
    width: 100%;
    height: 41px;
    box-sizing: content-box;
    padding-bottom: 1px;
    border-top: 1px solid rgb(223, 223, 223);
    background-color: rgb(240, 240, 240);
    place-items: center;

    ${Button} {
      position: absolute;
      right: 23px;
      width: 73px;
      height: 23px;
      padding-bottom: 1px;
      border: 1px solid rgb(173, 173, 173);
      background-color: rgb(225, 225, 225);
      font-size: 12px;
    }
  }
`;

export default StyledDialog;
