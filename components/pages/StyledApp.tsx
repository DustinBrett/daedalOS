import { SessionConsumer } from 'contexts/session';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from 'styles/GlobalStyle';
import themes from 'styles/themes';

type StyledAppProps = {
  children: React.ReactNode;
};

const StyledApp = ({ children }: StyledAppProps): JSX.Element => (
  <SessionConsumer>
    {({ themeName }) => (
      <ThemeProvider theme={themes[themeName] || themes.defaultTheme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    )}
  </SessionConsumer>
);

export default StyledApp;
