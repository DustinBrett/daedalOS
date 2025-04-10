import styled from "styled-components";
import { ThinScrollBars } from "components/system/Taskbar/Search/styles";
import ScrollBars from "styles/common/ScrollBars";
import { THIN_SCROLLBAR_WIDTH } from "utils/constants";

type StyledSectionsProps = {
  $singleLine: boolean;
};

const StyledSections = styled.div<StyledSectionsProps>`
  ${ScrollBars(THIN_SCROLLBAR_WIDTH, -2, -1)}
  ${ThinScrollBars}
  color: #fff;
  display: flex;
  height: ${({ theme }) =>
    `calc(100% - ${theme.sizes.search.headerHeight}px - ${theme.sizes.search.inputHeight}px)`};
  overflow: hidden;
  place-content: space-evenly;
  place-items: start;
  position: absolute;
  top: ${({ theme }) => `${theme.sizes.search.headerHeight}px`};
  width: 100%;

  @media (hover: none), (pointer: coarse) {
    overflow-y: scroll;
  }

  @supports (not (scrollbar-gutter: stable)) {
    padding-right: ${THIN_SCROLLBAR_WIDTH}px;

    @supports not selector(::-webkit-scrollbar) {
      padding-right: 8px;
    }

    @media (hover: hover), (pointer: fine) {
      &:hover {
        padding-right: 0;
      }
    }

    &:hover {
      overflow-y: scroll;
    }
  }

  @supports (scrollbar-gutter: stable) {
    &:hover {
      overflow-y: auto;
    }
  }

  figcaption {
    font-size: 13px;
    font-weight: 600;

    svg {
      fill: #fff;
      height: 16px;
      margin-bottom: -3px;
      margin-right: 6px;
      width: 16px;
    }
  }

  figure.card {
    background-color: rgb(45 45 45 / 60%);
    border-radius: 5px;
    padding: 8px 12px;

    &:hover {
      box-shadow: 0 3px 6px rgb(0 0 0 / 40%);
    }

    > figcaption {
      padding-left: 2px;
      white-space: nowrap;
    }

    ol {
      display: flex;
      gap: 9px;
      margin-top: 10px;
      place-content: space-between;

      li {
        display: flex;
        flex-direction: column;
        max-width: 80px;
        min-width: 80px;
        text-align: left;

        img {
          background-color: rgb(60 60 60 / 85%);
          border-radius: 5px;
          margin-bottom: 4px;
          min-height: 80px;
          min-width: 80px;
          padding: 12px;
          pointer-events: all;
          user-select: all;

          &:hover {
            background-color: rgb(16 88 145 / 85%);
          }
        }

        h4 {
          font-size: 11px;
          font-weight: 400;
          padding-left: 2px;
        }

        &:hover {
          h4 {
            text-decoration: underline;
          }
        }
      }
    }
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 10px 20px 24px;
    width: 100%;

    &:first-child {
      padding-bottom: ${({ $singleLine }) => ($singleLine ? 0 : undefined)};
    }
  }

  &.single-line {
    flex-direction: column;
    place-content: flex-start;

    figure.card {
      width: min-content;

      ol {
        gap: 16px;
      }
    }

    section {
      padding-right: 24px;

      &:not(:first-child) {
        padding-top: 16px;
      }
    }
  }
`;

export default StyledSections;
