import styled from "styled-components";

const StyledNavigation = styled.nav`
  display: flex;
  height: 43px;
  margin-top: -1px;
  background-color: rgb(25, 25, 25);

  button {
    width: 16px;
    height: 16px;
    margin: 13px 9px;

    svg {
      width: 16px;
      height: 16px;
      color: #fff;
      fill: currentColor;

      &:hover {
        color: rgb(50, 152, 254);
        transition: fill 0.5s ease;
      }

      &:active {
        color: rgb(54, 116, 178);
        transition: none;
      }
    }

    &[title^="Up"] {
      position: relative;
      right: -8px;
      margin-right: 8px;
    }

    &[title="Recent locations"] {
      position: absolute;
      left: 56px;

      svg {
        width: 6px;
        stroke: currentColor;
        stroke-width: 3px;
      }
    }

    &:disabled {
      svg {
        color: rgb(140, 140, 140);

        &:hover,
        &:active {
          color: rgb(140, 140, 140);
        }
      }
    }

    &:last-child {
      position: absolute;
      top: ${({ theme }) => `calc(${theme.sizes.titleBar.height} + 6px)`};
      right: 13px;
      width: 32px;
      height: 28px;
      margin: 0;
      background-color: rgb(25, 25, 25);
      stroke: rgb(128, 128, 128);
      stroke-width: 3;

      &:hover {
        border: 1px solid rgb(34, 114, 153);
        background-color: rgb(27, 41, 49);
      }

      &:active {
        border: 1px solid rgb(38, 160, 218);
        background-color: rgb(28, 57, 71);
      }
    }
  }
`;

export default StyledNavigation;
