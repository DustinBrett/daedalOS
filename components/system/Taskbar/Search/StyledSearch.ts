import { m as motion } from "motion/react";
import styled from "styled-components";
import { SINGLE_LINE_HEIGHT_ADDITION } from "components/system/Taskbar/Search";
import TaskbarPanel from "components/system/Taskbar/TaskbarPanel";

type StyledSearchProps = {
  $singleLine: boolean;
};

const StyledSearch = styled(motion.nav)<StyledSearchProps>`
  ${({ $singleLine, theme }) =>
    TaskbarPanel(
      theme.sizes.search.maxHeight +
        ($singleLine ? SINGLE_LINE_HEIGHT_ADDITION : 0),
      theme.sizes.search.size,
      theme.sizes.taskbar.button.width,
      true
    )}

  backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.panelBlur})`};

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
      appearance: none;
      background-color: #fff;
      border: 2px solid rgb(0 120 215);
      border-radius: 0;
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
        overflow: visible;
      }

      &::-webkit-search-cancel-button {
        margin: 0 0 0 8px;
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

    .no-results {
      display: flex;
      font-size: 14px;
      font-weight: 300;
      padding: 5px 15px;
      place-items: center;
      pointer-events: none;
      user-select: none;

      svg {
        fill: #fff;
        height: 32px;
        margin-right: 12px;
        width: 32px;
      }
    }

    .tab {
      color: rgb(175 175 175);
      display: flex;
      flex-direction: column;
      height: ${({ theme }) =>
        `calc(100% - ${theme.sizes.search.headerHeight}px - ${theme.sizes.search.inputHeight}px)`};
      place-content: center;
      place-items: center;
      position: absolute;
      top: ${({ theme }) => `${theme.sizes.search.headerHeight}px`};
      width: 100%;

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
        fill: rgb(115 115 115);
        height: 128px;
        width: 128px;
      }
    }

    > nav {
      position: absolute;
      right: 25px;
      top: 15px;

      .close-button svg {
        fill: rgb(200 200 200);
        height: 14px;

        &:hover {
          fill: #fff;
        }
      }
    }
  }

  > div {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
`;

export default StyledSearch;
