import { relocateShadowRoot } from "components/apps/MonacoEditor/functions";
import styled from "styled-components";

const StyledMonacoEditor = styled.div.attrs({ onBlur: relocateShadowRoot })`
  color: ${({ theme }) => theme.colors.text};
  width: 100%;

  && {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.titleBar.height}px - 31px) !important`};
  }
`;

export default StyledMonacoEditor;
