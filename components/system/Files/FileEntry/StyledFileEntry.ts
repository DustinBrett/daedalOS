import styled from 'styled-components';

const StyledFileEntry = styled.li`
  display: flex;
  height: min-content;
  padding: 2px;

  &:focus-within,
  &:hover {
    border: 2px solid transparent;
    padding: 0;
    position: relative;

    &::before {
      bottom: -1px;
      content: '';
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
      place-items: center;

      figcaption {
        -webkit-box-orient: vertical; /* stylelint-disable-line property-no-vendor-prefix */
        color: ${({ theme }) => theme.colors.fileEntry.text};
        display: -webkit-box; /* stylelint-disable-line value-no-vendor-prefix */
        font-size: ${({ theme }) => theme.sizes.fileEntry.fontSize};
        -webkit-line-clamp: 2;
        overflow: hidden;
        padding: 2px 0;
        text-shadow: ${({ theme }) => theme.colors.fileEntry.textShadow};
        word-break: break-all;
      }

      img {
        width: ${({ theme }) => theme.sizes.fileEntry.iconSize};
      }
    }
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.fileEntry.background};

    &::before {
      border: ${({ theme }) => `1px solid ${theme.colors.fileEntry.border}`};
    }
  }

  &:focus-within {
    background-color: ${({ theme }) =>
      theme.colors.fileEntry.backgroundFocused};

    &::before {
      border: ${({ theme }) =>
        `1px solid ${theme.colors.fileEntry.borderFocused}`};
    }

    figcaption {
      -webkit-line-clamp: initial;
      z-index: 1;
    }

    &:hover {
      background-color: ${({ theme }) =>
        theme.colors.fileEntry.backgroundFocusedHover};

      &::before {
        border: ${({ theme }) =>
          `1px solid ${theme.colors.fileEntry.borderFocusedHover}`};
      }
    }
  }
`;

export default StyledFileEntry;
