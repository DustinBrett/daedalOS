import styled from "styled-components";

const StyledControls = styled.nav`
  background-color: rgb(50 54 57);
  box-shadow: 0 0 5px hsl(0 0% 10% / 50%);
  display: flex;
  height: 40px;
  position: absolute;
  top: ${({ theme }) => theme.sizes.titleBar.height}px;
  width: 100%;
  z-index: 1;

  .side-menu {
    display: flex;
    overflow: hidden;
    place-items: center;
    white-space: nowrap;
    width: 100%;

    span {
      margin-right: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:first-child {
      color: #fff;
      font-size: 14px;
      margin-left: 16px;
      place-content: flex-start;
    }

    &:last-child {
      margin-right: 16px;
      place-content: flex-end;
    }
  }

  button {
    border-radius: 50%;
    display: flex;
    font-size: 24px;
    height: 30px;
    place-content: center;
    place-items: center;
    width: 30px;

    &.subtract {
      margin-right: 7px;
    }

    &.add {
      margin-left: 7px;
    }

    &:last-child {
      margin-left: 7px;
    }

    &:hover {
      background-color: rgb(66 70 73);
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
        fill: rgb(110 112 114);
        stroke: rgb(110 112 114);
      }
    }

    &.download {
      svg {
        margin-left: 1px;
        scale: 1.15;
        stroke-width: 1.75;
        transform: scale(1.25, 1);
      }
    }
  }

  ol {
    display: flex;
    flex-direction: row;
    height: 100%;
    place-content: center;
    place-items: center;
    width: 100%;

    li {
      color: #fff;
      display: flex;
      flex-direction: row;
      font-size: 14px;

      input {
        background-color: rgb(25 27 28);
        color: #fff;
        height: 20px;
        text-align: center;

        &:disabled {
          color: rgb(110 112 114);
        }
      }

      &:not(:last-child)::after {
        background-color: rgb(112 115 117);
        content: "";
        margin-left: 20px;
        width: 1px;
      }

      &.pages {
        letter-spacing: 1.5px;
        line-height: 20px;
        padding-right: 10px;
        width: max-content;

        input {
          margin: 0 5px;
          width: 24px;
        }
      }

      &.scale {
        display: flex;
        place-items: center;

        input {
          width: 45px;
        }
      }
    }
  }
`;

export default StyledControls;
