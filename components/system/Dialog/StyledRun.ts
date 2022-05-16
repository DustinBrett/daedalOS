import StyledButton from "components/system/Dialog/StyledButton";
import styled from "styled-components";

const StyledRun = styled.div`
  background-color: #fff;
  border: 1px solid rgb(240, 240, 240);
  font-size: 12px;

  figure {
    display: flex;
    flex-direction: row;
    padding: 20px 11px 14px;

    figcaption {
      line-height: 15px;
      margin-bottom: 4px;
    }

    img {
      height: 32px;
      margin-right: 19px;
      width: 32px;
    }
  }

  div {
    display: flex;
    flex-direction: row;

    label {
      margin-top: 3px;
      padding: 0 11px;
    }

    input {
      border: 1px solid rgb(122, 122, 122);
      border-radius: 0;
      font-family: ${({ theme }) => theme.formats.systemFont};
      font-size: 12px;
      height: 23px;
      line-height: 16px;
      margin: 0 13px 21px 8px;
      padding-bottom: 2px;
      padding-left: 5px;
      width: 100%;

      &:focus {
        border: 1px solid rgb(0, 120, 215);
      }
    }
  }

  nav {
    background-color: rgb(240, 240, 240);
    display: flex;
    flex-direction: row;
    height: 100%;

    ${StyledButton} {
      height: 24px;
      margin-top: 19px;
      position: absolute;
      right: 12px;
      width: 86px;

      &:first-child {
        right: 107px;
      }
    }
  }
`;

export default StyledRun;
