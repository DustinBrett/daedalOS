import styled from "styled-components";

const CONTROL_BAR_HEIGHT = 30;

const StyledVideoPlayer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;

  .video-js {
    height: 100%;
    width: 100%;

    .vjs-big-play-button {
      display: none;
    }

    .vjs-control-bar {
      background-color: rgb(240 240 240);
      padding: 0 1px;
      z-index: 9999;

      &:not(.no-interaction) {
        display: flex !important;
        opacity: 100% !important;
      }

      .no-interaction {
        display: none !important;
        opacity: 0% !important;
        pointer-events: none !important;
      }
    }

    &.vjs-youtube,
    &.vjs-fullscreen.vjs-user-inactive {
      .vjs-control-bar {
        opacity: 0% !important;
      }
    }

    .vjs-button {
      color: rgb(116 116 116);
      height: 28px;
      position: relative;
      width: 28px;
      z-index: 0;

      &::after {
        background-color: rgb(225 225 225);
        border: 1px solid rgb(173 173 173);
        content: "";
        height: calc(100% - 4px);
        left: 0;
        margin: 2px 0 0 2px;
        position: absolute;
        top: 1px;
        width: calc(100% - 4px);
        z-index: -1;
      }

      &:hover {
        &::after {
          background-color: rgb(229 241 251);
          border-color: rgb(0 120 215);
        }
      }

      &:active {
        &::after {
          background-color: rgb(204 228 247);
          border-color: rgb(0 84 153);
        }
      }
    }

    .vjs-current-time,
    .vjs-duration {
      display: block;
    }

    .vjs-current-time {
      padding-left: 8px;
      padding-right: 2px;
    }

    .vjs-duration {
      padding-left: 2px;
      padding-right: 8px;
    }

    .vjs-current-time-display,
    .vjs-duration-display {
      color: #000;
      font-family: sans-serif;
      font-size: 11px;
    }

    .vjs-picture-in-picture-control {
      margin: 0 -2px;
    }

    .vjs-load-progress {
      border-radius: 5px;

      div {
        background: linear-gradient(
          180deg,
          rgb(189 189 189) 0%,
          rgb(219 219 219) 100%
        );
        border-radius: 5px;
      }
    }

    .vjs-play-progress {
      background: linear-gradient(
        180deg,
        rgb(44 137 224) 0%,
        rgb(40 125 204) 100%
      );
      border-radius: 5px;

      &::before {
        color: rgb(237 237 237);
        text-shadow: 1px 2px 3px rgb(160 160 160);
        -webkit-text-stroke: 1px rgb(164 164 164 / 80%);
        top: 1px;
      }
    }

    .vjs-progress-holder {
      border-radius: 5px;
      font-size: 1.7em !important;
      height: 9px;
    }

    .vjs-volume-control {
      background-color: rgb(240 240 240);
      border-radius: 5px 5px 0 0;
      left: -28px !important;
      position: relative;

      .vjs-volume-bar {
        height: 5.5em;
        margin: 1.5em auto;
      }

      .vjs-volume-level {
        background: linear-gradient(
          180deg,
          rgb(247 76 100) 0%,
          rgb(125 210 125) 50%
        );
        border-radius: 5px;
        color: rgb(237 237 237);
        font-size: 1.5em;
        text-shadow: 1px 2px 3px rgb(160 160 160);
        -webkit-text-stroke: 1px rgb(164 164 164 / 80%);
      }
    }

    .vjs-volume-panel {
      width: 28px !important;
    }

    .vjs-fullscreen-control,
    .vjs-play-control {
      .vjs-icon-placeholder {
        &::before {
          font-size: 2.4em;
          top: -5px;
        }
      }

      &.vjs-ended {
        .vjs-icon-placeholder {
          &::before {
            font-size: 2.3em;
            top: -3px;
          }
        }
      }
    }

    .vjs-poster {
      background-size: contain;
    }

    video {
      background-image: url("/System/Icons/48x48/vlc.webp");
      background-position: center calc(50% - 15px);
      background-repeat: no-repeat;
      padding-bottom: ${CONTROL_BAR_HEIGHT}px;
    }
  }

  canvas {
    height: calc(100% - ${CONTROL_BAR_HEIGHT}px);
    object-fit: contain;
    position: absolute;
    visibility: hidden;
    width: 100%;
  }
`;

export default StyledVideoPlayer;
