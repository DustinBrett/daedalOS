import styled from "styled-components";

const StyledWidget = styled.div`
  backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.panelBlur})`};
  background-color: ${({ theme }) => theme.colors.taskbar.background};
  border: ${({ theme }) => `1px solid ${theme.colors.taskbar.peekBorder}`};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.colors.window.shadow};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.formats.systemFont};
  overflow: hidden;
  user-select: none;
  z-index: 1;

  .widget-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 10px 14px 6px;
  }
`;

export default StyledWidget;
