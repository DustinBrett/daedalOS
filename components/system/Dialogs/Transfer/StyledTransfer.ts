import styled, { css } from "styled-components";
import StyledButton from "components/system/Dialogs/StyledButton";

const gradientAnimation = css`
  animation: gradient 5s ease-in-out alternate infinite;
  background: ${({ theme }) =>
    `linear-gradient(-45deg, #fff, ${theme.colors.progressBarRgb}, #fff)`};
  background-size: 300% 300%;
  content: "";
  inset: 0;
  position: absolute;
`;

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
      border: 1px solid rgb(188 188 188);
      height: 15px;
      overflow: hidden;
      position: relative;
      width: 100%;

      &::-webkit-progress-bar {
        background: rgb(230 230 230);
      }

      &::-webkit-progress-value {
        background: ${({ theme }) => theme.colors.progressBarRgb};
      }

      &::-moz-progress-bar {
        background: ${({ theme }) => theme.colors.progressBarRgb};
      }

      &:indeterminate {
        /* stylelint-disable-next-line block-no-empty */
        &::-moz-progress-bar {
          ${gradientAnimation}
        }

        /* stylelint-disable-next-line block-no-empty */
        &::after {
          ${gradientAnimation}
        }
      }

      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }

        50% {
          background-position: 100% 50%;
        }

        100% {
          background-position: 0% 50%;
        }
      }
    }
  }

  div {
    margin-top: -3px;
  }

  h1 {
    background: linear-gradient(
      to right,
      rgb(220 229 244),
      rgb(155 192 227),
      rgb(0 43 85)
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

  nav {
    background-color: rgb(240 240 240);
    border-top: 1px solid rgb(223 223 223);
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
      right: 22px;
    }
  }
`;

export default StyledTransfer;
