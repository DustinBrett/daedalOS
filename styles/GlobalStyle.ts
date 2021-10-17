import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    border: 0;
    box-sizing: border-box;
    margin: 0;
    outline: 0;
    padding: 0;
    user-select: none;
  }

  body {
    font-family: ${({ theme }) => theme.formats.systemFont};
    height: 100%;
    overflow: hidden;
  }

  ol,
  ul {
    list-style: none;
  }
`;

export default GlobalStyle;
