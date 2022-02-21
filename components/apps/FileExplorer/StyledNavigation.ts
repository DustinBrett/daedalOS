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
  }
`;

export default StyledNavigation;
