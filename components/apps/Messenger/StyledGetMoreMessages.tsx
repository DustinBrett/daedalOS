import styled from "styled-components";

const StyledGetMoreMessages = styled.li`
  background-color: rgba(60, 56, 54, 50%);

  &:hover {
    background-color: rgba(60, 56, 54, 80%);
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
