import styled from "styled-components";

type ButtonProps = {
  $short?: boolean;
};

const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
  if (!(event.target instanceof HTMLTextAreaElement)) event.preventDefault();
};

const Button = styled.button.attrs({
  onKeyDown,
  type: "button",
})<ButtonProps>`
  background-color: transparent;
  font-family: inherit;
  width: ${({ $short }) => ($short ? "31px !important" : "100%")};
`;

export default Button;
