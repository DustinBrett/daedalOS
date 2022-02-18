import styled from "styled-components";

const StyledIRC = styled.div`
  display: flex;
  flex-direction: column;

  nav {
    display: flex;

    button {
      padding: 5px 10px;
    }

    input {
      border-right: 1px solid #e1e1e1;
      height: 100%;
    }

    #address {
      width: 100%;
    }

    #port {
      width: 50px;
    }

    #name {
      width: 100px;
    }
  }

  textarea {
    border-bottom: 1px solid #e1e1e1;
    border-top: 1px solid #e1e1e1;
    height: 100%;
    resize: none;
  }

  input > {
    height: 25px;
  }
`;

export default StyledIRC;
