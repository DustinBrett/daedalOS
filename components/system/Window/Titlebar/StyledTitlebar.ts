import styled, { type DefaultTheme } from "styled-components";

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
  background-color: ${({ $foreground, theme }) =>
    $foreground
      ? theme.colors.titleBar.background
      : theme.colors.titleBar.backgroundInactive};
  border-bottom: ${styledBorder};
  display: flex;
  height: ${({ theme }) => theme.sizes.titleBar.height}px;
  position: relative;
  top: 0;
  z-index: 2;

  > button {
    align-items: center;
    color: ${({ $foreground, theme }) =>
      $foreground
        ? theme.colors.titleBar.text
        : theme.colors.titleBar.textInactive};
    display: flex;
    flex-grow: 1;
    font-size: ${({ theme }) => theme.sizes.titleBar.fontSize};
    font-weight: 400;
    min-width: 0;

    figure {
      align-items: center;
      display: flex;
      margin-left: 8px;
      min-width: inherit;
      pointer-events: none;
      position: relative;
      top: -1px;

      picture {
        height: ${({ theme }) => theme.sizes.titleBar.iconSize};
        margin-right: ${({ theme }) => theme.sizes.titleBar.iconMarginRight};
        width: ${({ theme }) => theme.sizes.titleBar.iconSize};
      }

      img,
      picture {
        pointer-events: all;
      }

      figcaption {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  nav {
    display: flex;

    button {
      border-left: ${styledBorder};
      box-sizing: content-box;
      display: flex;
      place-content: center;
      place-items: center;
      width: ${({ theme }) => theme.sizes.titleBar.buttonWidth};

      svg {
        fill: ${({ $foreground, theme }) =>
          $foreground
            ? theme.colors.titleBar.text
            : theme.colors.titleBar.buttonInactive};
        margin: 0 1px 2px 0;
        width: ${({ theme }) => theme.sizes.titleBar.buttonIconWidth};
      }

      &.minimize {
        svg {
          margin-bottom: 1px;
          margin-right: 0;
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
        background-color: rgb(51 51 51);

        &.close {
          background-color: rgb(139 10 20);
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
