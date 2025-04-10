import styled from "styled-components";

const FG_COLOR = "hsl(270, 100%, 20%)";
const FG_LIGHT_COLOR = "hsl(270, 100%, 30%)";
const BG_COLOR = "#fff";
const DISABLED_COLOR = "#ccc";

const BORDER_RADIUS = "4px";
const INNER_SPACING = "5px";
const OUTER_SPACING = "13px";
const MAX_IMAGE_DIMENTION = "512px";

const StyledStableDiffusion = styled.div`
  display: flex;
  flex-direction: column;
  place-items: center;

  nav {
    display: flex;
    gap: ${INNER_SPACING};
    padding: ${OUTER_SPACING};
    width: 100%;

    .prompts {
      display: flex;
      flex-direction: column;
      gap: ${INNER_SPACING};
      min-width: 0;
      width: 100%;

      textarea {
        border: 1px solid ${FG_COLOR};
        border-radius: ${BORDER_RADIUS};
        font-family: ${({ theme }) => theme.formats.systemFont};
        font-size: 12px;
        padding: ${INNER_SPACING};
        resize: none;
      }
    }

    button {
      background: linear-gradient(
        to bottom right,
        ${FG_LIGHT_COLOR} 0%,
        ${FG_COLOR} 100%
      );
      border: 1px solid ${FG_COLOR};
      border-radius: ${BORDER_RADIUS};
      color: ${BG_COLOR};
      font-size: 14px;
      font-weight: 600;
      padding: 10px 15px;

      &:disabled {
        background: ${DISABLED_COLOR};
      }

      &:active:not(:disabled) {
        background: ${BG_COLOR};
        color: ${FG_COLOR};
      }
    }
  }

  .image {
    display: flex;
    margin: ${OUTER_SPACING};
    margin-top: 0;
    max-height: ${MAX_IMAGE_DIMENTION};
    max-width: ${MAX_IMAGE_DIMENTION};
    overflow: auto;
    place-content: center;
    place-items: center;
    position: relative;

    .status {
      background-color: ${BG_COLOR};
      border: 1px solid ${FG_COLOR};
      border-radius: ${BORDER_RADIUS};
      box-shadow: rgb(0 0 0 / 20%) 4px 4px 4px;
      margin: 10px;
      padding: 10px;
      position: absolute;
      text-align: center;
    }

    canvas {
      background-color: ${BG_COLOR};
      border: 1px solid ${FG_COLOR};
      border-radius: ${BORDER_RADIUS};
      max-height: 100%;
      max-width: 100%;
    }
  }
`;

export default StyledStableDiffusion;
