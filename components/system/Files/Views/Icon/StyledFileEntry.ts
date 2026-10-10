import styled from "styled-components";
import { type StyledFileEntryProps } from "components/system/Files/Views";

const StyledFileEntry = styled.li<StyledFileEntryProps>`
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  height: min-content;
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

  /* Outside, as captions run past the bottom edge of the button */
  :root[data-keyboard] & > button:focus {
    box-shadow: 0 0 0 1px var(--focus-inner, rgb(0 0 0));
    outline-offset: 1px;
  }

  /* Like Explorer, a lone selected entry already shows where focus is */
  :root[data-keyboard] :not(.multi-select) > &.focus-within > button:focus {
    box-shadow: none;
    outline: 0;
  }

  /* Apart from the first rule, as stylelint wants ascending specificity */
  :root[data-keyboard]
    ol[tabindex]:not(.has-selection):focus
    > &:first-of-type
    > button {
    box-shadow: 0 0 0 1px var(--focus-inner, rgb(0 0 0));
    outline-offset: 1px;
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

    @media (forced-colors: active) {
      outline: 1px solid highlight;
      outline-offset: -1px;
    }

    &:hover {
      background-color: ${({ $selecting, theme }) =>
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
