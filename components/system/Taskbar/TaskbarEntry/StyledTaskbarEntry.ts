import styled from 'styled-components';

type StyledTaskbarEntryProps = {
  foreground: boolean;
};

const StyledTaskbarEntry = styled.li<StyledTaskbarEntryProps>`
  border-bottom: ${({ theme }) =>
    `${theme.sizes.taskbar.entry.borderSize} solid transparent`};
  display: flex;
  min-width: 0;
  width: ${({ theme }) => theme.sizes.taskbar.entry.maxWidth};

  &::before {
    background-color: ${({ foreground, theme }) =>
      foreground ? theme.colors.taskbar.active : ''};
    border-bottom: ${({ theme }) => `
        ${theme.sizes.taskbar.entry.borderSize} solid ${theme.colors.highlight}
      `};
    content: '';
    height: 100%;
    margin: ${({ foreground }) => (foreground ? '' : '0 4px')};
    position: absolute;
    transition: all 0.075s;
    width: ${({ foreground, theme }) =>
      foreground
        ? theme.sizes.taskbar.entry.maxWidth
        : `calc(${theme.sizes.taskbar.entry.maxWidth} - 8px)`};
    z-index: -1;
  }

  &:hover {
    &::before {
      background-color: ${({ foreground, theme }) =>
        foreground
          ? theme.colors.taskbar.activeHover
          : theme.colors.taskbar.hover};
      margin: 0;
      width: ${({ theme }) => theme.sizes.taskbar.entry.maxWidth};
    }
  }

  figure {
    align-items: center;
    display: flex;
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
