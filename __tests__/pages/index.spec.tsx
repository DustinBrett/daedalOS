import { render } from '@testing-library/react';
import Index from 'pages/index';
import { ThemeProvider } from 'styled-components';
import defaultTheme from 'themes/default.json';

test('renders index page', () => {
  const { getByText } = render(
    <ThemeProvider theme={defaultTheme}>
      <Index />
    </ThemeProvider>
  );
  const helloWorldElement = getByText('Hello, world!');

  expect(helloWorldElement).toBeInTheDocument();
});
