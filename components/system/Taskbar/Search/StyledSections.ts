import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

type StyledSectionsProps = {
  $singleLine: boolean;
};

const StyledSections = styled.div<StyledSectionsProps>`
  ${ScrollBars()};
  color: #fbf1c7;
  display: flex;
  height: calc(100% - 52px);
  overflow: hidden;
  place-content: space-evenly;
  place-items: start;

  @media (hover: none), (pointer: coarse) {
    overflow-y: auto;
  }

  &:hover {
    overflow-y: auto;
  }

  figcaption {
    font-size: 13px;
    font-weight: 600;

    svg {
      fill: #fbf1c7;
      height: 16px;
      margin-bottom: -3px;
      margin-right: 6px;
      width: 16px;
    }
  }

  figure.card {
    background-color: rgba(50, 48, 47, 60%);
    border-radius: 5px;
    padding: 8px 12px;

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
          background-color: rgba(60, 56, 54, 85%);
          border-radius: 5px;
          margin-bottom: 4px;
          min-height: 80px;
          min-width: 80px;
          padding: 12px;
          pointer-events: all;
          user-select: all;

          &:hover {
            background-color: rgba(7, 102, 120, 85%);
          }
        }

        h4 {
          font-size: 11px;
          font-weight: 400;
          padding-left: 2px;
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
