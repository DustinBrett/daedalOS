import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    border: 0;
    box-sizing: border-box;
    cursor: default;
    font-variant-numeric: tabular-nums;
    margin: 0;
    outline: 0;
    padding: 0;
    text-rendering: optimizeLegibility;
    -webkit-touch-callout: none;
    user-select: none;
  }

  body, html {
    font-family: ${({ theme }) => theme.formats.systemFont};
  }

  body {
    height: 100%;
    overflow: hidden;
    position: fixed;
    text-size-adjust: none;
  }

  html {
    background-color: ${({ theme }) => theme.colors.background};
    background-position: center;
    /* stylelint-disable value-no-vendor-prefix */
    height: -webkit-fill-available;
    height: -moz-available;
    /* stylelint-enable value-no-vendor-prefix */
    transition: background-image 1.25s linear;
  }

  input::selection,
  textarea::selection {
    background-color: rgb(69, 133, 136);
    color: #fbf1c7;
  }

  input, textarea {
    cursor: text;
    user-select: text;
  }

  picture > img {
    display: block;
  }

  ol,
  ul {
    list-style: none;
  }
`;

export default GlobalStyle;
