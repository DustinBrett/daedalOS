import styled from "styled-components";
import { type StyledFileEntryProps } from "components/system/Files/Views";

const StyledFileEntry = styled.li<StyledFileEntryProps>`
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  height: min-content;
  margin-bottom: ${({ $labelHeightOffset }) =>
    $labelHeightOffset ? `-${$labelHeightOffset}px` : undefined};
  outline-offset: -2px;
  padding: ${({ theme }) => theme.sizes.fileEntry.iconPadding};

  button {
    position: relative;

    figure {
      display: flex;
      flex-direction: column;
      margin-bottom: -2px;
      place-items: center;

      figcaption {
        color: ${({ theme }) => theme.colors.fileEntry.text};
        font-size: ${({ theme }) => theme.sizes.fileEntry.fontSize};
        line-height: 1.2;
        margin: 1px 0;
        overflow-wrap: anywhere;
        padding: 2px 0;
        text-shadow: ${({ $desktop, theme }) =>
          $desktop ? theme.colors.fileEntry.textShadow : undefined};

        @supports not (overflow-wrap: anywhere) {
          /* stylelint-disable declaration-property-value-keyword-no-deprecated */
          word-break: break-word;
        }
      }

      textarea {
        position: absolute;
        top: ${({ theme }) => theme.sizes.fileEntry.iconSize};
      }

      picture {
        height: ${({ theme }) => theme.sizes.fileEntry.iconSize};
        width: ${({ theme }) => theme.sizes.fileEntry.iconSize};

        &:not(:first-of-type) {
          position: absolute;

          img {
            position: absolute;
          }
        }
      }
    }
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.fileEntry.background};
    outline: ${({ $desktop, theme }) =>
      $desktop ? `1px solid ${theme.colors.fileEntry.border}` : undefined};
  }

  &.focus-within {
    background-color: ${({ theme }) =>
      theme.colors.fileEntry.backgroundFocused};
    outline: ${({ $desktop, theme }) =>
      $desktop
        ? `1px solid ${theme.colors.fileEntry.borderFocused}`
        : undefined};
    z-index: 1;

    &:hover {
      background-color: ${({ theme, $selecting }) =>
        $selecting
          ? theme.colors.fileEntry.backgroundFocused
          : theme.colors.fileEntry.backgroundFocusedHover};
      outline: ${({ $desktop, theme }) =>
        $desktop
          ? `1px solid ${theme.colors.fileEntry.borderFocusedHover}`
          : undefined};
    }
  }
`;

export default StyledFileEntry;
