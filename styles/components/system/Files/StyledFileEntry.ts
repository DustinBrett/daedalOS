import styled from 'styled-components';

const StyledFileEntry = styled.li`
  display: flex;
  justify-content: center;
  padding: 2px;

  &:hover {
    background-color: hsla(0, 0%, 50%, 25%);
    border: 2px solid hsla(0, 0%, 50%, 25%);
    padding: 0;
    position: relative;

    &::before {
      border: 1px solid hsla(0, 0%, 70%, 55%);
      bottom: -1px;
      content: '';
      left: -1px;
      position: absolute;
      right: -1px;
      top: -1px;
    }
  }

  button {
    z-index: 1;

    figcaption {
      color: #fff;
      font-size: 11.5px;
      text-shadow: 0 0 1px rgba(0, 0, 0, 75%), 0 0 2px rgba(0, 0, 0, 50%),
        0 0 3px rgba(0, 0, 0, 25%), 0 1px 1px rgba(0, 0, 0, 75%),
        0 1px 2px rgba(0, 0, 0, 50%), 0 1px 3px rgba(0, 0, 0, 25%),
        0 2px 1px rgba(0, 0, 0, 75%), 0 2px 2px rgba(0, 0, 0, 50%),
        0 2px 3px rgba(0, 0, 0, 25%);
    }

    img {
      height: 48px;
      width: 48px;
    }
  }
`;

export default StyledFileEntry;
