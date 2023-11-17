import styled from "styled-components";

type StyledBrowserProps = {
  $hasSrcDoc: boolean;
};

const StyledBrowser = styled.div<StyledBrowserProps>`
  iframe {
    background-color: ${({ $hasSrcDoc }) =>
      $hasSrcDoc ? "#FBF1C7" : "initial"};
    border: 0;
    height: calc(100% - 36px - 33px);
    width: 100%;
  }

  nav {
    background-color: rgb(80, 73, 69);
    display: flex;
    padding: 4px 0;
    place-content: center;
    place-items: center;

    div {
      display: flex;
      justify-content: space-around;
      min-width: 102px;
      padding-left: 6px;
      width: 102px;
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
        fill: rgb(235, 219, 178);
        height: 22px;
        width: 22px;
      }

      &:hover {
        background-color: rgb(102, 92, 84);
      }

      &:active {
        background-color: rgb(124, 111, 100);
      }

      &:disabled {
        background-color: inherit;

        svg {
          fill: rgb(168, 153, 132);
        }
      }
    }

    &:not(:first-child) {
      border-bottom: 1px solid rgb(124, 111, 100);
      height: 33px;
      justify-content: left;
      padding: 0 8px;

      button {
        margin-bottom: 4px;
        margin-right: 4px;
      }
    }

    input {
      background-color: rgb(60, 56, 54);
      border-radius: 18px;
      color: rgb(251, 241, 199);
      font-family: ${({ theme }) => theme.formats.systemFont};
      font-size: 13px;
      height: 28px;
      letter-spacing: 0.2px;
      line-height: 26px;
      margin: 0 6px;
      padding: 0 13px;
      width: 100%;

      &:focus {
        outline: 2px solid rgb(131, 165, 152);
      }
    }
  }
`;

export default StyledBrowser;
