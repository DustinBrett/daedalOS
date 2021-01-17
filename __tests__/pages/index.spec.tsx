import { render } from '@testing-library/react';
import StyledApp from 'components/pages/StyledApp';
import Index from 'pages/index';

test('renders index page', () => {
  const { getByText } = render(
    <StyledApp>
      <Index />
    </StyledApp>
  );

  expect(getByText('Hello, world!')).toBeInTheDocument();
});
