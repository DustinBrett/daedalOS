import { memo } from "react";
import styled, { createGlobalStyle } from "styled-components";

const NoGlobalPointerEvents = createGlobalStyle`
  body {
    pointer-events: none;
  }
`;

export const StyledSelectionComponent = styled.span`
  background-color: ${({ theme }) => theme.colors.selectionHighlightBackground};
  border: ${({ theme }) => `1px solid ${theme.colors.selectionHighlight}`};
  position: absolute;
  z-index: 2;
`;

const StyledSelection: FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => (
  <>
    <NoGlobalPointerEvents />
    <StyledSelectionComponent {...props} />
  </>
);

export default memo(StyledSelection);
