import styled from "styled-components";

const StyledMonacoEditor = styled.div`
  color: ${({ theme }) => theme.colors.text};
  width: 100%;

  && {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.titleBar.height}px - 31px)`};
  }
`;

export default StyledMonacoEditor;
