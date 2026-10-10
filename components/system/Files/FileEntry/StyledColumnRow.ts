import styled from "styled-components";
import VisuallyHidden from "styles/common/VisuallyHidden";

const StyledColumnRow = styled.div`
  display: flex;
  font-size: 12px;
  height: ${({ theme }) => theme.sizes.fileManager.detailsRowHeight};
  margin-left: 2px;
  place-items: center;

  .label {
    ${VisuallyHidden};
  }

  div {
    color: rgb(222 222 222);
    overflow: hidden;
    padding-right: ${({ theme }) =>
      theme.sizes.fileManager.detailsEndPadding}px;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:last-child {
      margin-right: -${({ theme }) =>
          theme.sizes.fileManager.detailsEndPadding / 2}px;
      padding-right: ${({ theme }) =>
        theme.sizes.fileManager.detailsEndPadding - 4}px;
      text-align: right;
    }
  }
`;

export default StyledColumnRow;
