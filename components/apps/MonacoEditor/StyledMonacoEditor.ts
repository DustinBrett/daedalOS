import { overrideSubMenuStyling } from "components/apps/MonacoEditor/functions";
import styled from "styled-components";

const StyledMonacoEditor = styled.div.attrs({ onBlur: overrideSubMenuStyling })`
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.text};
`;

export default StyledMonacoEditor;
