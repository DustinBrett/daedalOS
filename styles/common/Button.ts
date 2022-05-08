import styled from "styled-components";

type ButtonProps = {
  $short?: boolean;
};

const Button = styled.button.attrs({
  onKeyDown: (event) => {
    if (!(event.target instanceof HTMLTextAreaElement)) event.preventDefault();
  },
  type: "button",
})<ButtonProps>`
  background-color: transparent;
  font-family: inherit;
  width: ${({ $short }) => ($short ? "31px !important" : "100%")};
`;

export default Button;
