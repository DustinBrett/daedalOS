import TaskbarPanel from "components/system/Taskbar/TaskbarPanel";
import { m as motion } from "framer-motion";
import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledSearch = styled(motion.nav)`
  ${({ theme }) =>
    TaskbarPanel(
      theme.sizes.search.maxHeight,
      theme.sizes.search.size,
      theme.sizes.taskbar.button.width,
      true
    )}

  @keyframes fade-in {
    0% {
      opacity: 0%;
    }

    100% {
      opacity: 100%;
    }
  }

  .search {
    width: 100%;

    input {
      border: 2px solid rgb(0, 120, 215);
      color: #000;
      font-size: 15px;
      height: 40px;
      padding: 10px;
      padding-left: 37px;
      width: 100%;

      &::placeholder {
        color: #000;
        inset: 0;
        left: 37px;
        opacity: 100%;
        position: absolute;
        top: 10px;
      }
    }

    svg {
      bottom: 12px;
      height: 16px;
      left: 12px;
      position: absolute;
      width: 16px;
      z-index: 2;
    }
  }

  .content {
    animation: fade-in 0.85s;
    height: calc(100% - 40px);

    nav {
      position: absolute;
      right: 25px;
      top: 15px;

      svg {
        fill: #fff;
        height: 14px;
      }
    }

    .no-results {
      color: #fff;
      display: flex;
      flex-direction: column;
      font-size: 30px;
      height: calc(100% - 52px);
      place-content: center;
      place-items: center;
    }

    .tab {
      color: rgb(175, 175, 175);
      display: flex;
      flex-direction: column;
      height: calc(100% - 52px);
      place-content: center;
      place-items: center;

      h1 {
        font-size: 28px;
        font-weight: 400;
        padding-top: 14px;
      }

      h3 {
        font-size: 14px;
        font-weight: 400;
        padding-top: 8px;
      }

      svg {
        fill: rgb(115, 115, 115);
        height: 128px;
        width: 128px;
      }
    }
  }

  > div {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .results {
    color: #fff;
    display: flex;
    height: calc(100% - 52px);
    width: 100%;

    .list {
      ${ScrollBars()}
      background-color: rgba(40, 40, 40, 95%);
      overflow-y: auto;
      width: 50%;

      > figure > figcaption {
        font-size: 13px;
        font-weight: 600;
        padding-bottom: 8px;
        padding-left: 12px;
        padding-top: 7px;
      }

      li {
        &.active-item {
          background-color: rgba(30, 80, 115, 75%);
        }

        position: relative;

        figure {
          display: flex;
          padding: 12px;
          padding-right: 32px;

          picture,
          img {
            height: 32px;
            width: 32px;
          }

          figcaption {
            font-size: 8px;
            margin-top: -2px;
            max-width: calc(100% - 26px);
            padding-left: 8px;

            h1 {
              font-size: 14.5px;
              font-weight: 400;
              overflow: hidden;
              padding-right: 12px;
              text-overflow: ellipsis;

              span {
                font-weight: 600;
              }
            }

            h2 {
              font-size: 13px;
              font-weight: 300;
              padding-top: 6px;
            }
          }

          &.simple {
            padding: 10px;

            picture,
            img {
              height: 16px;
              width: 16px;
            }

            figcaption {
              h1 {
                font-size: 13px;
                font-weight: 300;
                white-space: nowrap;
              }
            }
          }
        }

        div.select {
          border-left: 1px solid transparent;
          display: flex;
          height: 100%;
          place-content: center;
          place-items: center;
          position: absolute;
          right: 0;
          top: 0;
          width: 26px;

          svg {
            fill: #fff;
            height: 16px;
            width: 16px;
          }
        }

        &:hover {
          background-color: rgba(100, 100, 100, 95%);

          div.select {
            background-color: rgba(60, 60, 60, 95%);
            border-left: 1px solid rgba(40, 40, 40, 95%);
          }

          figure {
            &:not(:hover) {
              background-color: rgba(60, 60, 60, 95%);
            }
          }

          &.active-item {
            background-color: rgba(16, 88, 145, 95%);
          }
        }

        div.select:hover {
          background-color: rgba(100, 100, 100, 95%);
        }
      }
    }

    .details {
      background-color: rgba(20, 20, 20, 95%);
      border: 12px solid rgba(30, 30, 30, 95%);
      width: 50%;
    }
  }
`;

export default StyledSearch;
