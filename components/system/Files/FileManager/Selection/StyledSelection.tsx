import styled, { createGlobalStyle } from "styled-components";

const NoGlobalPointerEvents = createGlobalStyle`
  body {
    pointer-events: none;
  }
`;

const StyledSelectionComponent = styled.span`
  background-color: ${({ theme }) => theme.colors.highlightBackground};
  border: ${({ theme }) => `1px solid ${theme.colors.highlight}`};
  position: absolute;
  z-index: 2;
`;

const StyledSelection: FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => (
  <>
    <NoGlobalPointerEvents />
    <StyledSelectionComponent {...props} />
  </>
);

export default StyledSelection;
