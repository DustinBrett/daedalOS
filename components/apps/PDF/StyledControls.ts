import styled from "styled-components";

const StyledControls = styled.nav`
  background-color: rgb(50, 54, 57);
  box-shadow: 0 0 5px hsla(0, 0%, 10%, 50%);
  height: 40px;
  position: absolute;
  top: ${({ theme }) => theme.sizes.titleBar.height};
  width: 100%;
  z-index: 1;

  ol {
    display: flex;
    flex-direction: row;
    height: 100%;
    place-content: center;
    place-items: center;

    li {
      color: #fff;
      display: flex;
      flex-direction: row;
      font-size: 14px;

      input {
        background-color: rgb(25, 27, 28);
        color: #fff;
        height: 20px;
        text-align: center;

        &:disabled {
          color: rgb(110, 112, 114);
        }
      }

      &:not(:last-child)::after {
        background-color: rgb(112, 115, 117);
        content: "";
        margin-left: 20px;
        width: 1px;
      }

      &.pages {
        letter-spacing: 1.5px;
        line-height: 20px;
        padding-right: 10px;

        input {
          margin: 0 5px;
          width: 24px;
        }
      }

      &.scale {
        display: flex;
        place-items: center;

        button {
          border-radius: 50%;
          display: flex;
          font-size: 24px;
          height: 30px;
          place-content: center;
          place-items: center;
          width: 30px;

          &:first-child {
            margin-right: 7px;
          }

          &:last-child {
            margin-left: 7px;
          }

          &:hover {
            background-color: rgb(66, 70, 73);
          }

          svg {
            fill: #fff;
            height: 12px;
            stroke: #fff;
            width: 12px;
          }

          &:disabled {
            background-color: initial;

            svg {
              fill: rgb(110, 112, 114);
              stroke: rgb(110, 112, 114);
            }
          }
        }

        input {
          width: 45px;
        }
      }
    }
  }
`;

export default StyledControls;
