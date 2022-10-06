import styled from "styled-components";

const StyledWindow = styled.div`
  .loading {
    &::before {
      color: #fff;
      font-weight: 500;
      mix-blend-mode: normal;
      text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
    }
  }

  .app-installer-window {
    background: white;
  }

  button {
    width: 80px;
    height: 30px;
  }

  pre {
    background: lightgray;
    padding: 20px;
    margin: 20px;
  }
`;

export default StyledWindow;
