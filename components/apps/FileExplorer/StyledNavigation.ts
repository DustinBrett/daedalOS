import styled from "styled-components";

const StyledNavigation = styled.nav`
  background-color: rgb(25, 25, 25);
  display: flex;
  height: ${({ theme }) => theme.sizes.fileExplorer.navBarHeight};

  button {
    height: 16px;
    margin: 11px 9px;
    width: 16px;

    svg {
      color: #fff;
      fill: currentColor;
      height: 16px;
      transition: color 0.35s ease;
      width: 16px;

      &:hover {
        color: rgb(50, 152, 254);
      }

      &:active {
        color: rgb(54, 116, 178);
        transition: none;
      }
    }

    &[title^="Up"] {
      margin-bottom: 12px;
      margin-right: 0;
      margin-top: 10px;
    }

    &[title="Recent locations"] {
      margin-left: 1px;
      margin-right: 0;

      svg {
        stroke: currentColor;
        stroke-width: 3px;
        width: 7px;
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
