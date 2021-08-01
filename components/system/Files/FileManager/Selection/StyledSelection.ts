import styled from "styled-components";

const StyledSelection = styled.span`
  background-color: ${({ theme }) => theme.colors.highlightBackground};
  border: ${({ theme }) => `1px solid ${theme.colors.highlight}`};
  position: absolute;
  z-index: 1;
`;

export default StyledSelection;
