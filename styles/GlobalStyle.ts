import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    padding: 0;
    border: 0;
    margin: 0;
    outline: 0;
    user-select: none;
  }

  body {
    overflow: hidden;
    height: 100%;
    font-family: ${({ theme }) => theme.formats.systemFont};
  }

  ol,
  ul {
    list-style: none;
  }
`;

export default GlobalStyle;
