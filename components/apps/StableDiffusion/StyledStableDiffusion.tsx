import styled from "styled-components";

const StyledStableDiffusion = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  place-content: center;
  place-items: center;

  canvas {
    background-color: #fff;
    border: 2px solid rgb(52, 0, 104);
    border-radius: 10px;
    box-shadow: 0 0 4px #888;
    height: 512px;
    width: 512px;
  }

  nav {
    display: flex;
    gap: 5px;
    place-content: space-between;
    width: 512px;

    > div {
      display: flex;
      flex-direction: column;
      font-size: 14px;
      gap: 3px;
      width: 512px;

      input {
        border: 2px solid rgb(52, 0, 104);
        border-radius: 5px;
        font-size: 12px;
        height: 22px;
        padding: 5px;
      }
    }

    button {
      background-color: rgb(52, 0, 104);
      border: 2px solid rgb(52, 0, 104);
      border-radius: 5px;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      padding: 5px 10px;

      &:active {
        background-color: #fff;
        color: rgb(52, 0, 104);
      }
    }
  }
`;

export default StyledStableDiffusion;
