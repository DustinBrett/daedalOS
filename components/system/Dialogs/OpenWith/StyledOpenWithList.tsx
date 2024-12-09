import styled from "styled-components";

type StyledOpenWithListProps = {
  $hideBorder?: boolean;
};

const StyledOpenWithList = styled.ul<StyledOpenWithListProps>`
 
  padding-bottom: 9px;
  position: relative;
  width: 100%;

  &::before {
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
      background-color: rgb(222, 222, 222);
    }

    figure {
      color: #cecece;
      display: flex;
      padding: 0 23px;

      figcaption {
        font-size: 15px;
        padding: 0 12px;

      }

      picture {
        
        display: flex;
        height: 40px;
        place-content: center;
        place-items: center;
        width: 40px;
      }
    }

    &.selected {
      background-color: rgb(12, 131, 218);

      figcaption {
        color: #fff;
      }
    }

    padding: 5px 0;
  }
`;

export default StyledOpenWithList;
