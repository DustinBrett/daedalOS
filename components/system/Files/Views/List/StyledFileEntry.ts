import styled from "styled-components";

const StyledFileEntry = styled.li`
  display: flex;
  flex-direction: column;

  figure {
    display: flex;
    height: 36px;
    padding-bottom: 1px;
    padding-left: 1px;
    place-items: center;

    figcaption {
      color: #fff;
    }

    picture {
      margin-left: 3px;
      margin-right: 8px;
    }

    svg {
      fill: rgb(210 210 210);
      height: 8px;
      margin-left: auto;
      margin-right: 8px;
      pointer-events: none;
      width: 8px;
    }

    picture,
    svg {
      transition: margin 0.25s ease-out;
    }

    &:active {
      figcaption {
        letter-spacing: -0.15px;
        opacity: 90%;
      }

      picture {
        margin-left: 7px;
      }

      svg {
        margin-right: 12px;
      }

      picture,
      svg {
        transition: none;
      }
    }

    @media (pointer: fine) {
      &:hover {
        background-color: hsl(0 0% 35% / 70%);
      }
    }

    @media (pointer: coarse) {
      &:active {
        background-color: hsl(0 0% 35% / 70%);
        border: 1px solid hsl(0 0% 45% / 70%);
      }
    }
  }
`;

export default StyledFileEntry;
