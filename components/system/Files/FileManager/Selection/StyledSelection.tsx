import styled, { createGlobalStyle } from "styled-components";

const NoGlobalPointerEvents = createGlobalStyle`
  body {
    pointer-events: none;
  }
`;

const StyledSelectionComponent = styled.span`
  position: absolute;
  z-index: 2;
  border: ${({ theme }) => `1px solid ${theme.colors.highlight}`};
  background-color: ${({ theme }) => theme.colors.highlightBackground};
`;

const StyledSelection = (
  props: React.HTMLAttributes<HTMLSpanElement>
): JSX.Element => (
  <>
    <NoGlobalPointerEvents />
    <StyledSelectionComponent {...props} />
  </>
);

export default StyledSelection;
