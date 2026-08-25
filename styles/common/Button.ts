import styled from "styled-components";

type ButtonProps = {
  $short?: boolean;
};

const Button = styled.button.attrs(({ as }) => ({
  type: !as || as === "button" ? "button" : undefined,
}))<ButtonProps>`
  background-color: transparent;
  font-family: inherit;
  max-width: ${({ $short }) => ($short ? "31px" : undefined)};
  width: 100%;
`;

export default Button;
