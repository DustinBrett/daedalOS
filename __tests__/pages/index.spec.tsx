import { render } from "@testing-library/react";
import StyledApp from "components/pages/StyledApp";
import Index from "pages/index";

test("renders main role", () => {
  const { container } = render(
    <StyledApp>
      <Index />
    </StyledApp>
  );

  expect(container).toMatchSnapshot();
});
