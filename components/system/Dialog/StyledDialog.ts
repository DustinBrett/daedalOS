import styled from "styled-components";
import Button from "styles/common/Button";

const StyledDialog = styled.div`
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

    ${Button} {
      background-color: rgb(225, 225, 225);
      border: 1px solid rgb(173, 173, 173);
      font-size: 12px;
      height: 23px;
      padding-bottom: 1px;
      position: absolute;
      right: 23px;
      transition: all 0.25s ease-in-out;
      width: 73px;

      &:focus {
        border: 2px solid rgb(0, 120, 215);
      }

      &:hover {
        background-color: rgb(229, 241, 251);
        border: 1px solid rgb(0, 120, 215);
      }

      &:active {
        background-color: rgb(204, 228, 247);
        border: 1px solid rgb(0, 84, 153);
        transition: none;
      }
    }
  }
`;

export default StyledDialog;
