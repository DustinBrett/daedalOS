import styled from "styled-components";

const StyledSuggestions = styled.ol`
  display: grid;
  padding: 9px 0 0;

  li {
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    height: 51px;
    place-items: start;
    position: relative;
    width: 100%;

    figure {
      display: flex;
      padding: 9px 16px;
      place-items: center;
      position: relative;
      top: 1px;

      figcaption {
        font-size: 15px;
        font-weight: 400;
        padding-left: 12px;
        white-space: nowrap;
      }
    }

    &::before {
      border-top: 1px solid rgba(80, 73, 69, 55%);
      content: "";
      height: 100%;
      position: absolute;
      width: 100%;
    }

    &:first-child {
      &::before {
        border-top: none;
      }
    }

    &:hover {
      background-color: rgba(80, 73, 69, 75%);

      &::before {
        border: none;
      }

      + li {
        &::before {
          border-top: none;
        }
      }
    }
  }
`;

export default StyledSuggestions;
