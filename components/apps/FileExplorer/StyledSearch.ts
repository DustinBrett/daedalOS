import styled from "styled-components";

const StyledSearch = styled.div`
  display: flex;
  fill: red;
  border: 1px solid rgb(83, 83, 83);
  height: 30px;
  margin: 6px 12px 6px 0;
  max-width: 148px;
  padding: 0;
  width: 100%;
  position: relative;

  svg {
    position: absolute;
    fill: rgb(113, 113, 113);
    height: 12px;
    left: 14px;
    top: 7px;
    stroke: rgb(113, 113, 113);
    stroke-width: 1;
  }

  input {
    background-color: rgb(25, 25, 25);
    color: #fff;
    font-family: ${({ theme }) => theme.formats.systemFont};
    font-size: 12px;
    font-weight: 400;
    padding-left: 40px;
    width: 100%;
    height: 28px;
    padding-bottom: 2px;
    text-overflow: ellipsis;
  }
`;

export default StyledSearch;
