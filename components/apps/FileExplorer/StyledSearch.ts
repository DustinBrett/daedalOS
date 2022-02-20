import styled from "styled-components";

const StyledSearch = styled.input.attrs({
  spellCheck: false,
  type: "text",
})`
  background-color: rgb(25, 25, 25);
  background-image: none;
  background-position: 2px 5px;
  background-repeat: no-repeat;
  background-size: 16px;
  border: 1px solid rgb(83, 83, 83);
  color: #fff;
  font-family: ${({ theme }) => theme.formats.systemFont};
  font-size: 12px;
  font-weight: 400;
  height: 30px;
  margin: 6px 12px 6px 0;
  max-width: 148px;
  min-width: 100px;
  padding: 0 22px 2px 40px;
  text-overflow: ellipsis;
  width: 100%;
`;

export default StyledSearch;
