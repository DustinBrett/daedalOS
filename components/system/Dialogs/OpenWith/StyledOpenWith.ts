import styled from "styled-components";

const StyledOpenWith = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  div {
    height: calc(100% - 56px - 80px);
    overflow-y: scroll;
  }

  h2,
  h4 {
    font-weight: 400;
  }

  h2 {
    font-size: 18px;
    height: 56px;
    padding: 16px 24px;
  }

  h4 {
    padding: 0 0 6px 23px;
  }

  nav {
    background-color: #fff;
    height: 80px;
    width: 100%;

    button {
      background-color: rgb(204 204 204);
      color: #000;
      font-size: 15px;
      font-weight: 600;
      height: 32px;
      margin: 24px;
      position: absolute;
      right: 0;
      width: 200px;

      &:hover {
        background-color: rgb(216 216 216);
      }

      &:active {
        background-color: #000;
        color: #fff;
      }
    }
  }
`;

export default StyledOpenWith;
