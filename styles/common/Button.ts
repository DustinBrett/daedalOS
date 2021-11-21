import styled from "styled-components";

const Button = styled.button.attrs({
  onKeyDown: (event) => {
    if (!(event.target instanceof HTMLTextAreaElement)) event.preventDefault();
  },
  type: "button",
})`
  width: 100%;
  background-color: transparent;
  font-family: inherit;
`;

export default Button;
