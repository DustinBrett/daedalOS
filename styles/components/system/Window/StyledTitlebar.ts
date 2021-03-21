import styled from 'styled-components';

const StyledTitlebar = styled.header`
  background-color: #000;
  display: flex;

  h1 {
    color: #fff;
    display: flex;
    flex-grow: 1;
    font-size: 11.5px;
    font-weight: normal;
    height: 29px;

    figure {
      align-items: center;
      display: flex;

      img {
        height: 16px;
        margin: 0 8px;
        width: 16px;
      }
    }
  }

  nav {
    display: flex;

    button {
      display: flex;
      place-content: center;
      place-items: center;
      width: 45px;

      &:hover {
        background-color: rgb(26, 26, 26);

        &.close {
          background-color: rgb(232, 17, 35);
          transition: background-color 0.3s ease;
        }
      }

      svg {
        fill: #fff;
        width: 10px;
      }
    }
  }
`;

export default StyledTitlebar;
