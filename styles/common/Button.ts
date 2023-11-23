import styled from "styled-components";

type ButtonProps = {
  $short?: boolean;
};

const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
  if (!(event.target instanceof HTMLTextAreaElement)) event.preventDefault();
};

const Button = styled.button.attrs(({ as }) => ({
  onKeyDown,
  type: !as || as === "button" ? "button" : undefined,
}))<ButtonProps>`
  background-color: transparent;
  font-family: inherit;
  max-width: ${({ $short }) => ($short ? "31px" : undefined)};
  width: 100%;
`;

export default Button;
