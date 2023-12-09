import styled from "styled-components";

const StyledSearch = styled.div`
  border: 1px solid rgb(80, 73, 69);
  display: flex;
  height: 30px;
  margin: 6px 12px 6px 0;
  max-width: 148px;
  padding: 0;
  position: relative;
  width: 100%;

  svg {
    fill: rgb(102, 92, 84);
    height: 12px;
    left: 14px;
    pointer-events: none;
    position: absolute;
    stroke: rgb(102, 92, 84);
    stroke-width: 1;
    top: 8px;
  }

  input {
    background-color: rgb(29, 32, 33);
    color: #fbf1c7;
    font-family: ${({ theme }) => theme.formats.systemFont};
    font-size: 12px;
    font-weight: 400;
    height: 28px;
    padding-bottom: 2px;
    padding-left: 40px;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;

    &::-webkit-search-cancel-button {
      margin: 0 8px 0 6px;
    }
  }
`;

export default StyledSearch;
