import styled from "styled-components";

type StyledEmptyProps = {
  $hasColumns?: boolean;
};

// The accessible name mirrors the ::before text below, and role="status"
// makes the label valid (aria-label is dropped on generic divs)
const StyledEmpty = styled.div.attrs({
  "aria-label": "This folder is empty.",
  role: "status",
})<StyledEmptyProps>`
  position: absolute;
  width: 100%;

  &::before {
    color: #fff;
    content: "This folder is empty.";
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

export default StyledEmpty;
