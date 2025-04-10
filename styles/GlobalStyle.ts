import * as styled from "styled-components";

const GlobalStyle = styled.createGlobalStyle`
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
    -webkit-tap-highlight-color: transparent;
    text-rendering: optimizeLegibility;
    -webkit-touch-callout: none;
    user-select: none;
  }

  body,
  html {
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
    /* stylelint-disable value-no-vendor-prefix */
    height: -webkit-fill-available;
    height: -moz-available;
    /* stylelint-enable value-no-vendor-prefix */

    &::before,
    &::after {
      background-blend-mode: var(--background-blend-mode);
      background-position: center;
      content: "";
      height: 100%;
      position: absolute;
      transition: opacity var(--background-transition-timing, 0s) ease-in-out;
      width: 100%;
      z-index: -1;
    }

    &::before {
      background: var(--before-background);
      opacity: var(--before-background-opacity, 0%);
    }

    &::after {
      background: var(--after-background);
      opacity: var(--after-background-opacity, 100%);
    }
  }

  input::selection,
  textarea::selection {
    background-color: rgb(0 120 215);
    color: #fff;
  }

  input,
  textarea {
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
