import styled from 'styled-components';

type StyledTaskbarEntryProps = {
  foreground: boolean;
};

const StyledTaskbarEntry = styled.li<StyledTaskbarEntryProps>`
  background-color: ${({ foreground, theme }) =>
    foreground ? theme.colors.taskbar.active : ''};
  border-bottom: ${({ theme }) => `
    ${theme.sizes.taskbar.entry.borderSize} solid ${theme.colors.highlight}
  `};
  display: flex;
  margin: ${({ foreground }) => (foreground ? '' : '0 4px')};
  min-width: 0;
  padding: ${({ foreground }) => (foreground ? '0 4px' : '')};
  transition: all 0.075s;
  width: ${({ foreground, theme }) =>
    foreground
      ? theme.sizes.taskbar.entry.maxWidth
      : `calc(${theme.sizes.taskbar.entry.maxWidth} - 8px)`};

  &:hover {
    background-color: ${({ foreground, theme }) =>
      foreground
        ? theme.colors.taskbar.activeHover
        : theme.colors.taskbar.hover};
    margin: 0;
    padding: 0 4px;
    width: ${({ theme }) => theme.sizes.taskbar.entry.maxWidth};
  }

  figure {
    align-items: center;
    display: flex;
    padding: 4px;

    figcaption {
      color: ${({ theme }) => theme.colors.text};
      font-size: ${({ theme }) => theme.sizes.taskbar.entry.fontSize};
      margin-left: 4px;
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    img {
      height: ${({ theme }) => theme.sizes.taskbar.entry.icon.size};
      image-rendering: pixelated;
      position: relative;
      top: 1px;
      width: ${({ theme }) => theme.sizes.taskbar.entry.icon.size};
    }
  }
`;

export default StyledTaskbarEntry;
