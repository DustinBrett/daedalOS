import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledSections = styled.div`
  ${ScrollBars()};
  color: #fff;
  display: flex;
  gap: 20px;
  height: calc(100% - 52px);
  overflow: hidden auto;
  place-content: space-evenly;
  place-items: start;

  figcaption {
    font-size: 13px;
    font-weight: 600;
  }

  .suggested {
    display: grid;
    padding: 9px 0 15px;

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
        padding: 9px 15px;
        place-items: center;

        figcaption {
          font-size: 15px;
          font-weight: 400;
          padding-left: 13px;
          padding-top: 1px;
        }
      }

      &::before {
        border-top: 1px solid rgba(80, 80, 80, 55%);
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
        background-color: rgba(80, 80, 80, 75%);

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
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    padding: 20px 24px;
    width: 100%;
  }
`;

export default StyledSections;
