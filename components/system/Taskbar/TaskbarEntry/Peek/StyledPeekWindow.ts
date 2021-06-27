import styled from 'styled-components';

const StyledPeekWindow = styled.div`
  background-color: ${({ theme }) => theme.colors.taskbar.hover};
  border: ${({ theme }) => `1px solid ${theme.colors.taskbar.background}`};
  border-bottom: 0;
  bottom: ${({ theme }) => theme.sizes.taskbar.height};
  display: flex;
  place-content: center;
  place-items: flex-start;
  position: absolute;
  width: 150px;

  img {
    padding: 8px;
    width: 100%;
  }

  button {
    background-color: rgb(40, 40, 40);
    height: 32px;
    position: absolute;
    right: 0;
    top: 0;
    width: 32px;

    svg {
      fill: rgb(252, 246, 247);
      width: 12px;
    }

    &:active {
      background-color: rgb(139, 10, 20);
    }

    &:hover {
      background-color: rgb(194, 22, 36);
    }
  }
`;

export default StyledPeekWindow;
