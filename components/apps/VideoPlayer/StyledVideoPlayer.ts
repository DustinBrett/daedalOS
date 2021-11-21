import styled from "styled-components";

const StyledVideoPlayer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  .video-js {
    width: 100%;
    height: 100%;

    .vjs-big-play-button {
      display: none;
    }

    .vjs-control-bar {
      display: flex !important;
      padding: 0 1;
      background-color: rgb(240, 240, 240);
      opacity: 1 !important;
    }

    &.vjs-youtube,
    &.vjs-fullscreen.vjs-user-inactive {
      .vjs-control-bar {
        opacity: 0 !important;
      }
    }

    .vjs-button {
      position: relative;
      z-index: 0;
      width: 28px;
      height: 28px;
      color: rgb(116, 116, 116);

      &::after {
        position: absolute;
        z-index: -1;
        top: 1px;
        left: 0;
        width: calc(100% - 4px);
        height: calc(100% - 4px);
        border: 1px solid rgb(173, 173, 173);
        margin: 2px 0 0 2px;
        background-color: rgb(225, 225, 225);
        content: "";
      }

      &:hover {
        &::after {
          border-color: rgb(0, 120, 215);
          background-color: rgb(229, 241, 251);
        }
      }

      &:active {
        &::after {
          border-color: rgb(0, 84, 153);
          background-color: rgb(204, 228, 247);
        }
      }
    }

    .vjs-current-time,
    .vjs-duration {
      display: block;
    }

    .vjs-current-time {
      padding-right: 2px;
      padding-left: 8px;
    }

    .vjs-duration {
      padding-right: 8px;
      padding-left: 2px;
    }

    .vjs-current-time-display,
    .vjs-duration-display {
      color: #000;
      font-family: Sans-Serif;
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
          rgb(189, 189, 189) 0%,
          rgb(219, 219, 219) 100%
        );
        border-radius: 5px;
      }
    }

    .vjs-play-progress {
      background: linear-gradient(
        180deg,
        rgb(44, 137, 224) 0%,
        rgb(40, 125, 204) 100%
      );
      border-radius: 5px;

      &::before {
        top: -3px;
        color: rgb(237, 237, 237);
        text-shadow: 1px 2px 3px rgb(160, 160, 160);
        -webkit-text-stroke: 1px rgba(164, 164, 164, 0.8);
      }
    }

    .vjs-progress-holder {
      height: 9px;
      border-radius: 5px;
      font-size: 1.7em !important;
    }

    .vjs-volume-control {
      position: relative;
      left: -28px !important;
      background-color: rgb(240, 240, 240);
      border-radius: 5px 5px 0 0;

      .vjs-volume-bar {
        height: 5.5em;
        margin: 1.5em auto;
      }

      .vjs-volume-level {
        background: linear-gradient(
          180deg,
          rgb(247, 76, 100) 0%,
          rgb(125, 210, 125) 50%
        );
        border-radius: 5px;
        color: rgb(237, 237, 237);
        font-size: 1.5em;
        text-shadow: 1px 2px 3px rgb(160, 160, 160);
        -webkit-text-stroke: 1px rgba(164, 164, 164, 0.8);
      }
    }

    .vjs-volume-panel {
      width: 28px !important;
    }

    .vjs-fullscreen-control,
    .vjs-play-control {
      .vjs-icon-placeholder {
        &::before {
          top: -5px;
          font-size: 2.4em;
        }
      }
    }

    .vjs-poster {
      background-size: contain;
    }

    video {
      padding-bottom: 30px;
      background-image: url("/System/Icons/48x48/vlc.png");
      background-position: center calc(50% - 15px);
      background-repeat: no-repeat;
    }
  }
`;

export default StyledVideoPlayer;
