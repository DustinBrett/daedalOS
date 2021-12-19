import { relocateShadowRoot } from "components/apps/MonacoEditor/functions";
import StyledWindow from "components/system/Window/StyledWindow";
import styled from "styled-components";

const StyledMonacoEditor = styled.div.attrs({ onBlur: relocateShadowRoot })`
  color: ${({ theme }) => theme.colors.text};
  height: 100%;
  width: 100%;

  ${StyledWindow} & {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.titleBar.height} - 31px) !important`};
  }
`;

export default StyledMonacoEditor;
