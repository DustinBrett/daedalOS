import styled from "styled-components";

type StyledOpenWithListProps = {
  $hideBorder?: boolean;
};

const StyledOpenWithList = styled.ul<StyledOpenWithListProps>`
  border-top: 1px solid transparent;
  padding-bottom: 9px;
  position: relative;
  width: 100%;

  &::before {
    border-top: ${({ $hideBorder }) =>
      `1px solid ${$hideBorder ? "transparent" : "rgb(189, 174, 147)"}`};
    content: "";
    height: 1px;
    left: 17px;
    position: absolute;
    top: -1px;
    width: calc(100% - 34px);
  }

  li {
    &:active {
      scale: 0.975;
    }

    &:first-child {
      margin-top: 2px;
    }

    &:hover {
      background-color: rgb(235, 219, 178);
    }

    figure {
      display: flex;
      padding: 0 23px;

      figcaption {
        font-size: 15px;
        padding: 0 12px;
      }

      picture {
        background-color: rgb(69, 133, 136);
        display: flex;
        height: 40px;
        place-content: center;
        place-items: center;
        width: 40px;
      }
    }

    &.selected {
      background-color: rgb(131, 165, 152);

      figcaption {
        color: #fbf1c7;
      }
    }

    padding: 5px 0;
  }
`;

export default StyledOpenWithList;
