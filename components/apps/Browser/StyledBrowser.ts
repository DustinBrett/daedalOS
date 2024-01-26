import styled from "styled-components";

type StyledBrowserProps = {
  $hasSrcDoc: boolean;
};

const StyledBrowser = styled.div<StyledBrowserProps>`
  iframe {
    background-color: ${({ $hasSrcDoc }) => ($hasSrcDoc ? "#fff" : "initial")};
    border: 0;
    height: calc(100% - 42px - 37px);
    width: 100%;
  }

  nav {
    background-color: rgb(87, 87, 87);
    display: flex;
    padding: 4px 0;
    place-content: center;
    place-items: center;

    div {
      display: flex;
      justify-content: space-around;
      margin-right: 2px;
      min-width: 102px;
      padding-left: 4px;
      width: 142px;
    }

    button {
      border-radius: 50%;
      display: flex;
      height: 28px;
      place-content: center;
      place-items: center;
      transition: background 0.2s ease-in-out;
      width: 28px;

      svg {
        fill: rgb(240, 240, 240);
        height: 20px;
        width: 20px;
      }

      &:hover {
        background-color: rgb(103, 103, 103);
      }

      &:active {
        background-color: rgb(110, 110, 110);
      }

      &:disabled {
        background-color: inherit;

        svg {
          fill: rgb(152, 152, 152);
        }
      }
    }

    &:not(:first-child) {
      border-bottom: 1px solid rgb(118, 115, 118);
      height: 37px;
      justify-content: left;
      padding: 0 8px;

      button {
        margin-bottom: 4px;
        margin-right: 8px;
      }
    }

    input {
      background-color: rgb(64, 62, 65);
      border-radius: 18px;
      color: rgb(255, 255, 255);
      font-family: ${({ theme }) => theme.formats.systemFont};
      font-size: 13px;
      height: 34px;
      letter-spacing: 0.2px;
      margin: 0 6px;
      padding: 0 13px;
      padding-bottom: 2px;
      width: 100%;

      &:focus {
        outline: 2px solid rgb(168, 199, 250);
      }

      &::selection {
        background-color: rgb(0, 74, 119);
      }
    }
  }
`;

export default StyledBrowser;
