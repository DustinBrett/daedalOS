import styled from "styled-components";

const StyledOpenWith = styled.div`
  background-color: rgba(30,30,30,0.5);
  display: flex;
  flex-direction: column;
  height: 100%;

  .others {
    
    background: rgba(100,100,100,0.2);
    margin-top: 10px;
    margin-right: 50%;
   margin-left: 4.5%;
    padding-top: 1%;

  }
  div {
    height: calc(100% - 56px - 80px);
    overflow-y: scroll;
  }

  
  h4 {
    font-weight: 400;
    color: #fff;
  }

  h2 {
    font-size: 18px;
  
    color: #fff;
   border-bottom: 1px solid rgba(150,150,150,0.3);
    text-align: center;
    padding: 16px 24px;
  }

  h4 {
    padding: 0 0 6px 23px;
  }

  nav {
   
    height: 80px;
    width: 100%;

    button {
      background-color: rgb(100, 100, 100,0.5);
      border-radius: 10px;
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
