import styled from "styled-components";

const StyledNavigation = styled.nav`
  background-color: rgb(25, 25, 25);
  display: flex;
  height: ${({ theme }) => theme.sizes.fileExplorer.navBarHeight};

  svg {
    color: #fff;
    fill: currentColor;
    height: 16px;
    transition: color 0.35s ease;
    width: 16px;
  }

  > button {
    height: 16px;
    max-height: 36px;
    max-width: 34px;
    min-height: 36px;
    min-width: 34px;

    &[title^="Home"] {
      max-width: 0px;
      min-width: 0px;
      position: relative;
      right: 15px;
      top: -2px;
    }

    &[title="Recent locations"] {
      left: -15px;
      position: relative;

      svg {
        stroke: currentColor;
        stroke-width: 3px;
        width: 16px;
      }
    }

    &:active {
      svg {
        color: rgb(54, 116, 178);
        transition: none;
      }
    }

    &:hover {
      svg {
        color: rgb(50, 152, 254);
      }
    }

    &:disabled {
      svg {
        color: rgb(140, 140, 140);
      }
    }
  }
`;

export default StyledNavigation;
