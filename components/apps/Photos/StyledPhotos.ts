import { overrideSubMenuStyling } from "components/apps/MonacoEditor/functions";
import styled from "styled-components";

const buttonSize = "48px";
const paddingSize = "32px";

const StyledPhotos = styled.div.attrs({ onBlur: overrideSubMenuStyling })`
  position: relative;
  display: flex;
  height: 100%;
  padding-top: ${buttonSize};
  padding-bottom: ${paddingSize};
  background-color: #222;

  svg {
    fill: #fff;
  }

  figure {
    display: flex;
    overflow: hidden;
    width: 100%;
    height: 100%;
    margin: 0 ${paddingSize} ${paddingSize};
    place-content: center;
    place-items: center;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  nav {
    position: absolute;
    display: flex;
    height: ${buttonSize};
    place-content: center;
    place-items: center;

    &.top {
      top: 0;
      width: 100%;

      svg {
        height: 16px;
      }
    }

    &.bottom {
      right: 0;
      bottom: 0;

      svg {
        height: 20px;
        margin-top: 2px;
      }
    }

    button {
      width: ${buttonSize};
      height: ${buttonSize};

      &:disabled {
        pointer-events: none;

        svg {
          fill: rgb(125, 125, 125);
        }
      }

      &:hover {
        background-color: rgba(75, 75, 75, 0.5);
      }

      &:active {
        background-color: rgba(100, 100, 100, 0.5);
      }
    }
  }
`;

export default StyledPhotos;
