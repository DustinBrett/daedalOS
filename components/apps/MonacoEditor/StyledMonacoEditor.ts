import styled from "styled-components";

const StyledMonacoEditor = styled.div`
  color: ${({ theme }) => theme.colors.text};
  height: ${({ theme }) => `calc(100% - ${theme.sizes.taskbar.height})`};
  width: 100%;
`;

export default StyledMonacoEditor;
