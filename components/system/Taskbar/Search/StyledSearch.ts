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
        opacity: 100%;
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

    .tabs {
      border-bottom: 1px solid hsla(0, 0%, 13%, 40%);
      color: #fff;
      display: flex;
      font-size: 12px;
      font-weight: 600;
      gap: 1px;
      padding: 2px 13px 0;

      li {
        color: rgb(215, 215, 215);
        padding: 15px 13px 14px;

        &.active {
          border-bottom: 4px solid rgb(0, 120, 215);
          color: #fff;
        }

        &:hover {
          color: #fff;
        }
      }
    }

    .sections {
      ${ScrollBars()};
      color: #fff;
      display: flex;
      gap: 20px;
      height: calc(100% - 52px);
      overflow: hidden auto;
      place-content: space-evenly;
      place-items: start;

      figcaption {
        font-size: 13px;
        font-weight: 600;
      }

      .suggested {
        display: grid;
        padding: 9px 0 15px;

        li {
          border-radius: 5px;
          display: flex;
          flex-direction: column;
          height: 51px;
          place-items: start;
          position: relative;
          width: 100%;

          figure {
            display: flex;
            padding: 9px 15px;
            place-items: center;

            figcaption {
              font-size: 15px;
              font-weight: 400;
              padding-left: 13px;
              padding-top: 1px;
            }
          }

          &::before {
            border-top: 1px solid rgba(80, 80, 80, 55%);
            content: "";
            height: 100%;
            position: absolute;
            width: 100%;
          }

          &:first-child {
            &::before {
              border-top: none;
            }
          }

          &:hover {
            background-color: rgba(80, 80, 80, 75%);

            &::before {
              border: none;
            }

            + li {
              &::before {
                border-top: none;
              }
            }
          }
        }
      }

      section {
        display: flex;
        flex-direction: column;
        gap: 20px;
        height: 100%;
        padding: 20px 24px;
        width: 100%;
      }
    }
  }
`;

export default StyledSearch;
