import styled from "styled-components";

const StyledOpenWith = styled.div`
  background-color: rgba(30,30,30,0.5);
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
    color: #fff
  }

  h2 {
    font-size: 18px;
    height: 56px;
        color: #fff

    padding: 16px 24px;
  }

  h4 {
    padding: 0 0 6px 23px;
  }

  nav {
   
    height: 80px;
    width: 100%;

    button {
      background-color: rgb(160, 160, 160);
      border-radius: 10px
      color: #000;
      font-size: 15px;
      font-weight: 600;
      height: 32px;
      margin: 24px;
      position: absolute;
      right: 0;
      width: 200px;

      &:hover {
        background-color: rgb(216, 216, 216);
      }

      &:active {
        background-color: #000;
        color: #fff;
      }
    }
  }
`;

export default StyledOpenWith;
