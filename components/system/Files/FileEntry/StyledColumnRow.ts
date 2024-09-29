import styled from "styled-components";

const StyledColumnRow = styled.div`
  display: flex;

  div {
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:last-child {
      margin-right: -6px;
      padding-right: 6px;
    }
  }
`;

export default StyledColumnRow;
