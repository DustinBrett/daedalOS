import styled from "styled-components";

const StyledAddressBar = styled.div`
  background-position: 2px 5px;
  background-repeat: no-repeat;
  background-size: 16px;
  border: 1px solid rgb(83, 83, 83);
  display: flex;
  height: 25px;
  margin: 6px 12px 6px 5px;
  padding: 0 22px 2px 24px;
  position: relative;
  width: 100%;

  input {
    background-color: rgb(25, 25, 25);
    border-right: 1px solid rgb(21, 21, 21);
    color: #fff;
    font-family: ${({ theme }) => theme.formats.systemFont};
    font-size: 12px;
    font-weight: 400;
    height: 23px;
    padding-bottom: 1px;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 2px);
  }

  img {
    left: 3px;
    position: absolute;
    top: 3px;
  }

  .refresh {
    background-color: rgb(25, 25, 25);
    display: flex;
    height: 23px;
    margin: 0;
    place-content: center;
    place-items: center;
    position: absolute;
    right: 0;
    stroke: rgb(128, 128, 128);
    stroke-width: 3;
    top: 0;
    width: 24px;

    &:hover {
      background-color: rgb(27, 41, 49);
      border: 1px solid rgb(34, 114, 153);
    }

    &:active {
      background-color: rgb(28, 57, 71);
      border: 1px solid rgb(38, 160, 218);
    }

    svg {
      position: relative;
      top: -1px;
    }
  }
`;

export default StyledAddressBar;
