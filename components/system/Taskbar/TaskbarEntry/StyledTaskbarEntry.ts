import styled from 'styled-components';

const StyledTaskbarEntry = styled.li`
  border-bottom: ${({ theme }) => `
    ${theme.sizes.taskbar.entry.borderSize} solid ${theme.colors.highlight}
  `};
  display: flex;
  height: 100%;
  max-width: ${({ theme }) => theme.sizes.taskbar.entry.maxWidth};

  figure {
    align-items: center;
    display: flex;

    figcaption {
      color: ${({ theme }) => theme.colors.text};
      font-size: ${({ theme }) => theme.sizes.taskbar.entry.fontSize};
    }

    img {
      height: ${({ theme }) => theme.sizes.taskbar.entry.icon.size};
      margin: ${({ theme }) => theme.sizes.taskbar.entry.icon.margin};
      width: ${({ theme }) => theme.sizes.taskbar.entry.icon.size};
    }
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbar.hover};
  }
`;

export default StyledTaskbarEntry;
