import styled from "styled-components";

const StyledColumnRow = styled.div`
  display: flex;
  height: ${({ theme }) => theme.sizes.fileManager.detailsRowHeight};
  place-items: center;

  div {
    color: #fff;
    overflow: hidden;
    padding-right: ${({ theme }) =>
      theme.sizes.fileManager.detailsEndPadding}px;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:last-child {
      margin-right: -${({ theme }) => theme.sizes.fileManager.detailsEndPadding / 2}px;
      padding-right: ${({ theme }) =>
        theme.sizes.fileManager.detailsEndPadding / 2}px;
    }
  }
`;

export default StyledColumnRow;
