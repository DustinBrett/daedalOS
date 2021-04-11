import styled from 'styled-components';

const StyledTaskbarEntry = styled.li`
  border-bottom: ${({ theme }) => `
    ${theme.sizes.taskbar.entry.borderSize} solid ${theme.colors.highlight}
  `};
  display: flex;
  margin: 0 4px;
  min-width: 0;
  padding: 0;
  width: ${({ theme }) => `calc(${theme.sizes.taskbar.entry.maxWidth} - 8px)`};

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbar.hover};
    margin: 0;
    padding: 0 4px;
    width: ${({ theme }) => theme.sizes.taskbar.entry.maxWidth};
  }

  figure {
    align-items: center;
    display: flex;

    figcaption {
      color: ${({ theme }) => theme.colors.text};
      font-size: ${({ theme }) => theme.sizes.taskbar.entry.fontSize};
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    img {
      height: ${({ theme }) => theme.sizes.taskbar.entry.icon.size};
      margin: ${({ theme }) => theme.sizes.taskbar.entry.icon.margin};
      width: ${({ theme }) => theme.sizes.taskbar.entry.icon.size};
    }
  }
`;

export default StyledTaskbarEntry;
