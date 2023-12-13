import styled from "styled-components";

const StyledSearch = styled.div`
  border: 1px solid rgb(80, 73, 69);
  display: flex;
  height: 25px;
  margin: 6px 12px 6px 0;
  max-width: 148px;
  overflow: hidden;
  padding: 0;
  position: relative;
  width: 100%;

  svg {
    display: none;
  }

  input {
    background-color: rgb(29, 32, 33);
    color: #fbf1c7;
    font-family: ${({ theme }) => theme.formats.systemFont};
    font-size: 12px;
    font-weight: 400;
    height: 23px;
    padding-bottom: 1px;
    padding-left: 8px;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;

    &::-webkit-search-cancel-button {
      margin: 0 8px 0 6px;
    }
  }

  input:placeholder-shown ~ svg {
    display: block;
    fill: rgb(102, 92, 84);
    height: 12px;
    pointer-events: none;
    position: absolute;
    right: 6px;
    stroke: rgb(102, 92, 84);
    stroke-width: 1;
    top: 6px;
    width: 12px;
  }
`;

export default StyledSearch;
