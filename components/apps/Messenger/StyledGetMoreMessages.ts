import styled from "styled-components";

const StyledGetMoreMessages = styled.li`
  background-color: rgb(68 69 70 / 50%);

  &:hover {
    background-color: rgb(68 69 70 / 80%);
  }

  button {
    color: inherit;
    display: flex;
    font-size: 16px;
    font-weight: 600;
    height: 30px;
    place-content: center;
    place-items: center;

    &:disabled {
      opacity: 25%;
    }
  }
`;

export default StyledGetMoreMessages;
