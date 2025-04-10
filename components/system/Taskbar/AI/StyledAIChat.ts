import { m as motion } from "motion/react";
import styled from "styled-components";
import { TASKBAR_HEIGHT } from "utils/constants";

type StyledAIChatProps = {
  $primaryColor: string;
  $responding: boolean;
  $scrollbarVisible: boolean;
  $secondaryColor: string;
  $tertiaryColor: string;
  $typing: boolean;
  $width: number;
  $zIndex: number;
};

const StyledAIChat = styled(motion.section)<StyledAIChatProps>`
  background-color: rgb(32 32 32);
  border-left: 1px solid rgb(104 104 104);
  bottom: ${TASKBAR_HEIGHT}px;
  color: rgb(200 200 200);
  font-size: 14px;
  height: calc(100% - ${TASKBAR_HEIGHT}px);
  position: absolute;
  right: 0;
  z-index: ${({ $zIndex }) => $zIndex};

  section {
    &::-webkit-scrollbar {
      width: 16px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-clip: content-box;
      background-color: rgb(77 77 77);
      border: 6px solid transparent;
      border-radius: 16px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: rgb(121 121 121);
    }

    display: flex;
    flex-direction: column;
    height: calc(100% - 49px - 122px);
    min-width: ${({ $width }) => $width - 1}px;
    overflow: hidden auto;
    place-content: space-between;

    .convo-header {
      color: #fff;
      display: flex;
      flex-direction: column;
      gap: 20px;
      place-content: center;
      place-items: center;
      width: ${({ $scrollbarVisible }) =>
        $scrollbarVisible ? "calc(100% + 6px)" : "100%"};

      .title {
        display: flex;
        font-size: 28px;
        font-weight: 700;

        > svg {
          height: 34px;
          margin-right: 8px;
          margin-top: 3px;
          width: 34px;
        }
      }

      .convo-style {
        display: flex;
        flex-direction: column;
        gap: 17px;
        place-content: center;
        place-items: center;

        .buttons {
          border: 1px solid rgb(102 102 102);
          border-radius: 4px;
          display: flex;
          margin-bottom: 48px;

          button {
            background-color: transparent;
            border-radius: 4px;
            color: #fff;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            max-width: 100px;
            min-width: 100px;
            padding: 7px 28px;
            place-items: center;

            &.selected {
              background: ${({ $secondaryColor, $tertiaryColor }) =>
                `linear-gradient(135deg, ${$secondaryColor} 0%, ${$tertiaryColor} 100%)`};
            }
          }

          h2,
          h4 {
            font-weight: 400;
            pointer-events: none;
          }

          h2 {
            font-size: 12.5px;
          }

          h4 {
            font-size: 9.5px;
            padding-bottom: 3px;
          }
        }
      }
    }

    .conversation {
      color: #fff;
      display: flex;
      flex-direction: column;
      font-size: 13.5px;
      gap: 13px;
      letter-spacing: 0.2px;
      margin-bottom: ${({ $responding }) => ($responding ? "43px" : undefined)};
      padding: 16px;
      padding-bottom: 5px;

      .user {
        .avatar {
          .person {
            background: ${({ $tertiaryColor }) => $tertiaryColor};
            border-radius: 50%;
            fill: rgb(255 255 255 / 45%);
            padding: 5px;
          }
        }
      }

      .ai {
        /* stylelint-disable-next-line selector-type-no-unknown */
        think {
          border-left: 2px solid rgb(78 78 86);
          color: rgb(166 166 166);
          display: flex;
          flex-direction: column;
          font-size: 13px;
          gap: 10px;
          margin-left: 5px;
          margin-top: 12px;
          padding-left: 10px;
          white-space: normal;
        }

        .message.hide-think {
          /* stylelint-disable-next-line selector-type-no-unknown */
          think {
            display: none;
          }
        }
      }

      .avatar {
        display: flex;
        font-size: 15px;
        padding-bottom: 12px;
        place-items: center;

        svg {
          height: 24px;
          margin-right: 12px;
          width: 24px;
        }
      }

      .thinking {
        background-color: rgb(73 73 73);
        border-radius: 6px;
        color: #fff;
        cursor: pointer;
        font-family: ${({ theme }) => theme.formats.systemFont};
        font-size: 12px;
        letter-spacing: 0.5px;
        margin-left: 30px;
        padding: 7px 11px;

        &.thinking-responding {
          cursor: default;
        }
      }

      .message {
        cursor: text;
        padding-left: 36px;
        user-select: text;
        white-space: pre-line;

        * {
          cursor: text;
          user-select: text;
        }

        pre {
          background-color: rgb(26 26 26);
          border: 1px solid rgb(48 48 48);
          border-radius: 5px;
          padding: 12px;
        }

        code {
          white-space: pre-wrap;

          &.language-js,
          &.language-python {
            &::before {
              background-color: rgb(29 29 29);
              border-top-left-radius: 5px;
              border-top-right-radius: 5px;
              display: flex;
              font-family: ${({ theme }) => theme.formats.systemFont};
              font-size: 15px;
              font-weight: 600;
              height: 40px;
              left: -12px;
              padding: 0 12px;
              place-items: center;
              position: relative;
              top: -12px;
              width: calc(100% + 24px);
            }
          }

          &.language-js::before {
            content: "JavaScript";
          }

          &.language-python::before {
            content: "Python";
          }
        }

        &:hover {
          + .controls button {
            visibility: visible;
          }
        }

        p:last-child {
          display: inline;
        }

        pre:last-child {
          display: inline-block;
        }
      }

      .image-container {
        background-color: rgb(240 240 240);
        border: 1px solid rgb(102 102 102);
        border-radius: 10px;
        margin-bottom: 18px;
        margin-top: 10px;
        padding: 12px;

        canvas {
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

          animation: gradient 15s ease infinite;
          background: linear-gradient(
            -45deg,
            #ee7752,
            #e73c7e,
            #23a6d5,
            #23d5ab
          );
          background-size: 400% 400%;
          border-radius: 10px;
          height: auto;
          max-width: 100%;
        }

        &:not(.generating) canvas {
          animation: unset;
          background: transparent;
          background-size: unset;
        }

        .prompt {
          color: rgb(15 15 15);
          font-size: 12px;
          padding-bottom: 6px;
          padding-left: 6px;
        }

        .powered-by {
          display: flex;
          place-content: end;
          width: 100%;

          div {
            background-color: rgb(230 230 230);
            border: 1px solid rgb(220 220 220);
            border-radius: 5px;
            color: rgb(90 90 90);
            font-size: 11.5px;
            padding: 5px;
            width: fit-content;
          }
        }
      }

      .responding {
        background-color: rgb(32 32 32);
        bottom: 120px;
        display: flex;
        left: 0;
        margin: 0 16px;
        margin-top: -6px;
        padding: 7px 0;
        place-content: center;
        place-items: center;
        position: absolute;
        width: calc(100% - 32px);

        .stop {
          background-color: rgb(45 45 45);
          border: ${({ $primaryColor }) => `1px solid ${$primaryColor}`};
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          display: flex;
          font-size: 13px;
          letter-spacing: 0.3px;
          min-height: 36px;
          padding: 8px;
          place-content: center;
          place-items: center;

          &:hover {
            background-color: rgb(50 50 50);
          }

          &.canceling {
            background-color: rgb(42 42 42);
          }

          .stop-icon {
            fill: ${({ $primaryColor }) => $primaryColor};
            height: 18px;
            margin-right: 6px;
            width: 18px;
          }
        }
      }

      .failed-session {
        display: flex;
        font-size: 12px;
        margin-bottom: 10px;
        place-content: center;
        place-items: center;
        width: ${({ $scrollbarVisible }) =>
          $scrollbarVisible ? "calc(100% + 6px)" : "100%"};

        &::before,
        &::after {
          border-bottom: 1px solid rgb(48 48 48);
          content: "";
          flex: 1 1 0%;
          margin-top: 3px;
        }

        &::before {
          margin-inline-end: 5px;
        }

        &::after {
          margin-inline-start: 5px;
        }

        a {
          color: ${({ $primaryColor }) => $primaryColor};
          cursor: pointer;
          margin-left: 4px;
        }

        .warning-icon {
          fill: ${({ $primaryColor }) => $primaryColor};
          height: 18px;
          margin-right: 4px;
          margin-top: 2px;
          width: 18px;
        }
      }

      .controls {
        padding-left: 36px;
        padding-top: 11px;
        pointer-events: all;
        position: relative;

        &.hidden {
          display: none;
        }

        &.invisible {
          height: 13px;
          opacity: 0%;
          pointer-events: none;
        }

        .control {
          background-color: transparent;
          border-radius: 5px;
          height: 32px;
          visibility: hidden;
          width: 32px;

          &:hover {
            background-color: rgb(45 45 45);
            border: 1px solid rgb(65 65 65);
          }

          &:active {
            background-color: rgb(42 42 42);
          }

          .control-icon {
            fill: #fff;
            height: 20px;
            width: 20px;
          }

          .save-icon {
            position: relative;
            top: 1px;
          }

          .background-icon {
            position: relative;
            top: -1px;
          }
        }

        &:hover,
        &.last {
          .control {
            visibility: visible;
          }
        }
      }
    }
  }

  .header {
    height: 49px;
    min-width: ${({ $width }) => $width - 1}px;
    padding: 14px 15px 16px;

    header {
      display: flex;
      justify-content: space-between;
      padding: 3px 1px;

      nav {
        position: relative;
        right: -8px;
        top: -9px;

        .close {
          border-radius: 5px;
          height: 36px;
          transition: background-color 0.2s ease-in-out;
          width: 36px;

          > svg {
            fill: rgb(241 241 241);
            width: 12px;
          }

          &:hover {
            background-color: rgb(49 49 49);
          }
        }
      }
    }
  }

  footer {
    bottom: 0;
    display: flex;
    flex-direction: row;
    height: 122px;
    min-width: ${({ $width }) => $width - 1}px;
    padding: 16px 14px;
    place-content: space-between;
    position: absolute;

    .new-topic {
      background: ${({ $secondaryColor, $tertiaryColor }) =>
        `linear-gradient(135deg, ${$secondaryColor} 0%, ${$tertiaryColor} 100%)`};
      border-radius: 50%;
      cursor: pointer;
      height: 40px;
      place-content: center;
      place-items: center;
      transition: opacity 0.1s 0.1s ease-in-out;
      width: 40px;

      > .chat {
        fill: #fff;
        height: 20px;
        pointer-events: none;
        position: relative;
        top: 1px;
        width: 20px;
      }

      &:active {
        border: 1px solid rgb(32 32 32);
      }
    }

    .submit {
      background-color: transparent;
      border-radius: 5px;
      height: 36px;
      position: relative;
      right: 5px;
      top: 49px;
      width: 36px;

      .send {
        fill: ${({ $primaryColor, $typing }) =>
          $typing ? $primaryColor : "rgb(99, 99, 99)"};
        height: 20px;
        pointer-events: none;
        position: relative;
        top: 1px;
        width: 20px;
      }

      &:hover {
        background-color: ${({ $typing }) =>
          $typing ? "rgb(44, 44, 44)" : undefined};
        cursor: ${({ $typing }) => ($typing ? "pointer" : undefined)};
      }

      &:active {
        background-color: rgb(38 38 38);
      }
    }

    textarea {
      background-color: rgb(31 31 31);
      border: 1px solid rgb(102 102 102);
      border-radius: 7px;
      bottom: 16px;
      color: #fff;
      font-family: ${({ theme }) => theme.formats.systemFont};
      font-size: 12.5px;
      letter-spacing: 0.6px;
      min-height: 90px;
      overflow: hidden;
      padding: 13px 44px 13px 15px;
      position: absolute;
      resize: none;
      right: 14px;
      transition:
        border-bottom 0.2s 0.2s ease-in-out,
        width 0.2s 0.2s ease-in-out;
      width: calc(100% - 80px);

      &::placeholder {
        color: rgb(206 206 206);
      }

      &:focus {
        border-bottom: ${({ $primaryColor }) => `2px solid ${$primaryColor}`};
        width: ${({ $typing }) => ($typing ? "calc(100% - 28px)" : undefined)};

        & + .new-topic {
          opacity: ${({ $typing }) => ($typing ? "0%" : "100%")};
          transition-delay: ${({ $typing }) => ($typing ? 0.2 : 0.4)}s;
        }
      }

      &:not(:focus) + .new-topic {
        transition-delay: 0.4s;
      }
    }
  }
`;

export default StyledAIChat;
