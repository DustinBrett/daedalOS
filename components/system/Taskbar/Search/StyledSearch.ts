import { m as motion } from "framer-motion";
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
      border: 2px solid rgb(7, 102, 120);
      border-radius: 0;
      color: #282828;
      font-size: 15px;
      height: 40px;
      padding: 10px;
      padding-left: 37px;
      width: 100%;

      &::placeholder {
        color: #282828;
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
        fill: #fbf1c7;
        height: 32px;
        margin-right: 12px;
        width: 32px;
      }
    }

    .tab {
      color: rgb(189, 174, 147);
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
        fill: rgb(124, 111, 100);
        height: 128px;
        width: 128px;
      }
    }

    > nav {
      position: absolute;
      right: 25px;
      top: 15px;

      .close-button svg {
        fill: rgb(213, 196, 161);
        height: 14px;

        &:hover {
          fill: #fbf1c7;
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
