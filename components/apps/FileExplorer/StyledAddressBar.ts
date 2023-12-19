import styled from "styled-components";

const StyledAddressBar = styled.div`
  background-position: 2px 5px;
  background-repeat: no-repeat;
  background-size: 16px;
  border: 1px solid rgb(80, 73, 69);
  display: flex;
  height: 25px;
  margin: 6px 12px 6px 5px;
  padding: 0 22px 2px 24px;
  position: relative;
  width: 100%;

  input {
    background-color: rgb(29, 32, 33);
    border-right: 1px solid rgb(21, 21, 21);
    color: #fbf1c7;
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
    background-color: rgb(29, 32, 33);
    display: flex;
    height: 23px;
    margin: 0;
    place-content: center;
    place-items: center;
    position: absolute;
    right: 0;
    stroke: rgb(124, 111, 100);
    stroke-width: 3;
    top: 0;
    width: 24px;

    &:hover {
      background-color: rgb(69, 133, 136);
      border: 1px solid rgb(131, 165, 152);
    }

    &:active {
      background-color: rgb(177, 98, 134);
      border: 1px solid rgb(211, 134, 155);
    }

    svg {
      position: relative;
      top: -1px;
    }

    svg {
      position: relative;
      top: -1px;
    }
  }
`;

export default StyledAddressBar;
