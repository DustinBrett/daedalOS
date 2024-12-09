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

  :root {
  --sb-track-color: #ffffff;
  --sb-thumb-color: #4a4a4a;
  --sb-size: 2px;
}

*::-webkit-scrollbar {
  width: var(--sb-size);
  height: var(--sb-size); /* For horizontal scrollbars */
}

*::-webkit-scrollbar-track {
  background: var(--sb-track-color);
  border-radius: 1px;
}

*::-webkit-scrollbar-thumb {
  background: var(--sb-thumb-color);
  border-radius: 1px;
}

@supports not (selector(::-webkit-scrollbar)) {
  * {
    scrollbar-color: var(--sb-thumb-color) var(--sb-track-color);
  }
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
      transition: opacity 1.25s ease-in-out;
      width: 100%;
      z-index: -1;
    }

    &::before {
      background: var(--before-background);
      opacity: var(--before-background-opacity);
    }

    &::after {
      background: var(--after-background);
      opacity: var(--after-background-opacity);
    }
  }

  input::selection,
  textarea::selection {
    background-color: rgb(0, 120, 215);
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
