import type { StyledFileEntryProps } from "components/system/Files/Views";
import styled from "styled-components";

const StyledFileEntry = styled.li<StyledFileEntryProps>`
  display: flex;
  height: min-content;
  padding: 2px;

  &.focus-within,
  &:hover {
    border: 2px solid transparent;
    padding: 0;
    position: relative;

    &::before {
      bottom: -1px;
      content: "";
      left: -1px;
      position: absolute;
      right: -1px;
      top: -1px;
    }
  }

  button {
    position: relative;

    figure {
      display: flex;
      flex-direction: column;
      margin-bottom: -2px;
      place-items: center;

      figcaption {
        -webkit-box-orient: vertical; /* stylelint-disable-line property-no-vendor-prefix */
        color: ${({ theme }) => theme.colors.fileEntry.text};
        display: -webkit-box; /* stylelint-disable-line value-no-vendor-prefix */
        font-size: ${({ theme }) => theme.sizes.fileEntry.fontSize};
        letter-spacing: -0.1px;
        -webkit-line-clamp: 2;
        line-height: 1.2;
        margin: 1px 0;
        overflow: hidden;
        padding: 2px 1px;
        text-shadow: ${({ theme }) => theme.colors.fileEntry.textShadow};
        word-break: break-word;
      }

      img {
        width: ${({ theme }) => theme.sizes.fileEntry.iconSize};
      }
    }
  }

  &:hover {
    background-color: ${({ dragging, theme }) =>
      !dragging && theme.colors.fileEntry.background};

    &::before {
      border: ${({ dragging, theme }) =>
        !dragging && `1px solid ${theme.colors.fileEntry.border}`};
    }
  }

  &.focus-within {
    background-color: ${({ dragging, theme }) =>
      !dragging && theme.colors.fileEntry.backgroundFocused};
    z-index: 1;

    &::before {
      border: ${({ dragging, theme }) =>
        !dragging && `1px solid ${theme.colors.fileEntry.borderFocused}`};
    }

    figcaption:not(.truncate) {
      -webkit-line-clamp: initial;
    }

    &:hover {
      background-color: ${({ dragging, theme }) =>
        !dragging && theme.colors.fileEntry.backgroundFocusedHover};

      &::before {
        border: ${({ dragging, theme }) =>
          !dragging &&
          `1px solid ${theme.colors.fileEntry.borderFocusedHover}`};
      }
    }
  }
`;

export default StyledFileEntry;
