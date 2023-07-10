import styled from "styled-components";

const buttonSize = "48px";
const paddingSize = "32px";

type StyledPhotosProps = {
  $showImage: boolean;
};

const StyledPhotos = styled.div<StyledPhotosProps>`
  background-color: #282828;
  display: flex;
  height: 100%;
  padding-bottom: ${paddingSize};
  padding-top: ${buttonSize};
  position: relative;

  svg {
    fill: #fbf1c7;
  }

  figure {
    display: flex;
    height: 100%;
    margin: 0 ${paddingSize} ${paddingSize};
    overflow: hidden;
    place-content: center;
    place-items: center;
    width: 100%;

    div {
      color: rgb(168, 153, 132);
      font-size: 13px;
      padding: 0 38px;
      text-align: center;
    }

    img {
      display: ${({ $showImage }) => ($showImage ? "block" : "none")};
      max-height: 100%;
      max-width: 100%;
    }
  }

  nav {
    display: flex;
    height: ${buttonSize};
    place-content: center;
    place-items: center;
    position: absolute;

    &.top {
      top: 0;
      width: 100%;

      svg {
        height: 16px;
      }
    }

    &.bottom {
      bottom: 0;
      right: 0;

      svg {
        height: 20px;
        margin-top: 2px;
      }
    }

    button {
      height: ${buttonSize};
      width: ${buttonSize};

      &:disabled {
        pointer-events: none;

        svg {
          fill: rgb(124, 111, 100);
        }
      }

      &:hover {
        background-color: rgba(780, 73, 69, 50%);
      }

      &:active {
        background-color: rgba(102, 92, 84, 50%);
      }
    }
  }
`;

export default StyledPhotos;
