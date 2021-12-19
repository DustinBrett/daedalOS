import styled from "styled-components";

const StyledNavigation = styled.nav`
  background-color: rgb(25, 25, 25);
  display: flex;
  height: 43px;
  margin-top: -1px;

  button {
    height: 16px;
    margin: 13px 9px;
    width: 16px;

    svg {
      color: #fff;
      fill: currentColor;
      height: 16px;
      width: 16px;

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
      margin-right: 8px;
      position: relative;
      right: -8px;
    }

    &[title="Recent locations"] {
      left: 56px;
      position: absolute;

      svg {
        stroke: currentColor;
        stroke-width: 3px;
        width: 6px;
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
      background-color: rgb(25, 25, 25);
      height: 28px;
      margin: 0;
      position: absolute;
      right: 13px;
      stroke: rgb(128, 128, 128);
      stroke-width: 3;
      top: ${({ theme }) => `calc(${theme.sizes.titleBar.height} + 6px)`};
      width: 28px;

      &:hover {
        background-color: rgb(27, 41, 49);
        border: 1px solid rgb(34, 114, 153);
      }

      &:active {
        background-color: rgb(28, 57, 71);
        border: 1px solid rgb(38, 160, 218);
      }
    }
  }
`;

export default StyledNavigation;
