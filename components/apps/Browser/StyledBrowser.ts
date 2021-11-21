import styled from "styled-components";

const StyledBrowser = styled.div`
  iframe {
    width: 100%;
    height: calc(100% - 36px);
    border: 0;
  }

  nav {
    display: flex;
    padding: 4px 0;
    background-color: rgb(87, 87, 87);
    place-content: center;
    place-items: center;

    div {
      display: flex;
      width: 102px;
      min-width: 102px;
      justify-content: space-around;
      padding-left: 6px;
    }

    button {
      display: flex;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      place-content: center;
      place-items: center;
      transition: background 0.2s ease-in-out;

      svg {
        width: 22px;
        height: 22px;
        fill: rgb(240, 240, 240);
      }

      &:hover {
        background-color: rgb(100, 100, 100);
      }

      &:active {
        background-color: rgb(109, 109, 109);
      }

      &:disabled {
        background-color: inherit;

        svg {
          fill: rgb(152, 152, 152);
        }
      }
    }

    input {
      width: 100%;
      height: 28px;
      padding: 0 13px;
      margin: 0 6px;
      background-color: rgb(64, 62, 65);
      border-radius: 18px;
      color: rgb(255, 255, 255);
      font-family: ${({ theme }) => theme.formats.systemFont};
      font-size: 13px;
      letter-spacing: 0.2px;
      line-height: 30px;
    }
  }
`;

export default StyledBrowser;
