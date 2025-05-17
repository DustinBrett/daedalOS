import styled from "styled-components";

type StyledLoadingProps = {
  $hasColumns?: boolean;
};

const StyledLoading = styled.div<StyledLoadingProps>`
  cursor: wait;
  height: 100%;
  width: 100%;

  &::before {
    color: #fff;
    content: "Working on it...";
    display: flex;
    font-size: 12px;
    font-weight: 200;
    justify-content: center;
    letter-spacing: 0.3px;
    mix-blend-mode: difference;
    padding-top: ${({ $hasColumns, theme }) =>
      $hasColumns
        ? theme.sizes.window.textTopPadding +
          theme.sizes.fileManager.columnHeight
        : theme.sizes.window.textTopPadding}px;
  }
`;

export default StyledLoading;
