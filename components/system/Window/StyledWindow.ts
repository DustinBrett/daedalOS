import styled from 'styled-components';

type StyledWindowProps = {
  minimized?: boolean;
};

const StyledWindow = styled.section<StyledWindowProps>`
  background-color: ${({ theme }) => theme.colors.window.background};
  box-shadow: ${({ theme }) => theme.colors.window.shadow};
  display: ${({ minimized = false }) => (minimized ? 'none' : 'block')};
  height: 100%;
  outline: ${({ theme }) =>
    `${theme.sizes.window.outline} solid ${theme.colors.window.outline}`};
  overflow: hidden;
  position: absolute;
  width: 100%;
`;

export default StyledWindow;
