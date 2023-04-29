import styled from "styled-components";

type StyledStableDiffusionProps = {
  $hasWebGPU?: boolean;
};

const StyledStableDiffusion = styled.div<StyledStableDiffusionProps>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  place-content: center;
  place-items: center;

  &::after {
    align-items: center;
    background-color: rgba(0, 0, 0, 30%);
    color: #fff;
    content: "No WebGPU Support";
    display: ${({ $hasWebGPU }) => ($hasWebGPU ? "none" : "flex")};
    font-size: 26px;
    font-weight: bold;
    inset: 0;
    justify-content: center;
    position: absolute;
    text-shadow: 2px 2px 4px #000;
  }

  canvas {
    aspect-ratio: 1 / 1;
    background-color: #fff;
    border: 2px solid rgb(52, 0, 104);
    border-radius: 10px;
    box-shadow: 0 0 4px #888;
    max-height: 512px;
    max-width: 512px;
    width: calc(100% - 32px);
  }

  nav {
    display: flex;
    gap: 5px;
    max-width: 512px;
    place-content: space-between;
    width: calc(100% - 32px);

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

      div {
        background-color: #fff;
        border: 2px solid rgb(52, 0, 104);
        border-radius: 5px;
        height: 47px;
        line-height: 43px;
        max-width: 422px;
        overflow: hidden;
        padding: 0 5px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
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
