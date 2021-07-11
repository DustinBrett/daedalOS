import styled from "styled-components";

type StyledTaskbarEntryProps = {
  foreground: boolean;
};

const StyledTaskbarEntry = styled.li<StyledTaskbarEntryProps>`
  display: flex;
  min-width: 0;
  place-content: center;
  position: relative;
  width: ${({ theme }) => theme.sizes.taskbar.entry.maxWidth};

  &::before {
    background-color: ${({ foreground, theme }) =>
      foreground ? theme.colors.taskbar.foreground : ""};
    border-bottom: ${({ theme }) => `
        ${theme.sizes.taskbar.entry.borderSize} solid ${theme.colors.highlight}
      `};
    bottom: 0;
    content: "";
    height: ${({ foreground }) => (foreground ? "100%" : 0)};
    margin: ${({ foreground }) => (foreground ? "" : "0 4px")};
    position: absolute;
    transition-duration: 0.1s;
    transition-property: ${({ foreground }) => (foreground ? "all" : "width")};
    width: ${({ foreground }) => (foreground ? "100%" : `calc(100% - 8px)`)};
    z-index: -1;
  }

  &:hover {
    &::before {
      background-color: ${({ foreground, theme }) =>
        foreground
          ? theme.colors.taskbar.foregroundHover
          : theme.colors.taskbar.hover};
      height: 100%;
      margin: 0;
      width: 100%;
    }
  }

  &:active {
    &::before {
      background-color: ${({ foreground, theme }) =>
        foreground
          ? theme.colors.taskbar.activeForeground
          : theme.colors.taskbar.active};
    }
  }

  figure {
    align-items: center;
    display: flex;
    margin-bottom: ${({ theme }) => theme.sizes.taskbar.entry.borderSize};
    margin-left: 4px;
    padding: 4px;

    figcaption {
      color: ${({ theme }) => theme.colors.text};
      font-size: ${({ theme }) => theme.sizes.taskbar.entry.fontSize};
      letter-spacing: -0.1px;
      margin-left: 5px;
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    img {
      height: ${({ theme }) => theme.sizes.taskbar.entry.icon.size};
      position: relative;
      top: 1px;
      width: ${({ theme }) => theme.sizes.taskbar.entry.icon.size};
    }
  }
`;

export default StyledTaskbarEntry;
