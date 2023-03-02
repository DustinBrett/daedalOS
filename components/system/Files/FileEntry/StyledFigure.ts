import styled from "styled-components";

type StyledFigureProps = {
  $renaming: boolean;
};

const StyledFigure = styled.figure<StyledFigureProps>`
  pointer-events: ${({ $renaming }) => ($renaming ? "all" : undefined)};

  figcaption {
    pointer-events: none;
  }
`;

export default StyledFigure;
