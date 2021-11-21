import type { DefaultTheme } from "styled-components";
import styled from "styled-components";

type StyledTitlebarProps = {
  $foreground: boolean;
};

const styledBorder = ({
  $foreground,
  theme,
}: StyledTitlebarProps & { theme: DefaultTheme }): string =>
  $foreground
    ? `1px solid ${theme.colors.titleBar.background}`
    : `1px solid ${theme.colors.titleBar.backgroundInactive}`;

const StyledTitlebar = styled.header<StyledTitlebarProps>`
  position: relative;
  z-index: 2;
  top: 0;
  display: flex;
  height: ${({ theme }) => theme.sizes.titleBar.height};
  border-bottom: ${styledBorder};
  background-color: ${({ $foreground, theme }) =>
    $foreground
      ? theme.colors.titleBar.background
      : theme.colors.titleBar.backgroundInactive};

  h1 {
    display: flex;
    min-width: 0;
    flex-grow: 1;
    color: ${({ $foreground, theme }) =>
      $foreground
        ? theme.colors.titleBar.text
        : theme.colors.titleBar.textInactive};
    font-size: ${({ theme }) => theme.sizes.titleBar.fontSize};
    font-weight: normal;

    figure {
      position: relative;
      top: -1px;
      display: flex;
      min-width: inherit;
      align-items: center;
      margin-left: 8px;

      img {
        width: ${({ theme }) => theme.sizes.titleBar.iconSize};
        height: ${({ theme }) => theme.sizes.titleBar.iconSize};
        margin-right: ${({ theme }) => theme.sizes.titleBar.iconMarginRight};
      }

      figcaption {
        overflow: hidden;
        letter-spacing: -0.1px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  nav {
    display: flex;

    button {
      display: flex;
      width: ${({ theme }) => theme.sizes.titleBar.buttonWidth};
      box-sizing: content-box;
      border-left: ${styledBorder};
      place-content: center;
      place-items: center;

      svg {
        width: ${({ theme }) => theme.sizes.titleBar.buttonIconWidth};
        margin: 0 1px 2px 0;
        fill: ${({ $foreground, theme }) =>
          $foreground
            ? theme.colors.titleBar.text
            : theme.colors.titleBar.buttonInactive};
      }

      &.minimize {
        svg {
          margin-right: 0;
          margin-bottom: 1px;
        }
      }

      &:hover {
        background-color: ${({ theme }) =>
          theme.colors.titleBar.backgroundHover};

        svg {
          fill: ${({ theme }) => theme.colors.titleBar.text};
        }

        &.close {
          background-color: ${({ theme }) => theme.colors.titleBar.closeHover};
          transition: background-color 0.25s ease;
        }
      }

      &:active {
        background-color: rgb(51, 51, 51);

        &.close {
          background-color: rgb(139, 10, 20);
        }
      }

      &:disabled {
        svg {
          fill: ${({ $foreground }) =>
            $foreground ? "rgb(50, 50, 50)" : "rgb(60, 60, 60)"};
        }

        &:hover {
          background-color: inherit;
        }
      }
    }
  }
`;

export default StyledTitlebar;
