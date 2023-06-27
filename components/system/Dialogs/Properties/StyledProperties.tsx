import styled from "styled-components";

const StyledProperties = styled.div`
  padding: 0 7px;

  table {
    background-color: #fff;
    border: 1px solid rgb(217, 217, 217);
    height: calc(100% - 37px - 28px);
    padding-top: 14px;
    width: 100%;

    tbody {
      display: flex;
      flex-direction: column;
      font-size: 11.5px;
      gap: 11px;

      tr {
        display: flex;
        padding: 0 14px;
        place-content: center;
        place-items: center;
      }

      th {
        font-weight: 400;
        text-align: left;
        width: 75px;
      }

      td {
        display: flex;
        width: calc(100% - 70px);

        &.spacer {
          border-bottom: 1px solid rgb(160, 160, 160);
          display: block;
          width: 100%;
        }

        input {
          border: 1px solid rgb(122, 122, 122);
          font-size: 11px;
          height: 23px;
          margin-top: -4px;
          padding: 3px;
          width: 100%;
        }

        img {
          margin-right: 5px;
        }
      }
    }
  }

  nav {
    &.buttons {
      display: flex;
      gap: 8px;
      height: 37px;
      place-content: end;
      place-items: center;

      button {
        height: 21px;
      }
    }

    &.tabs {
      display: flex;
      height: 28px;
      padding-top: 7px;
      position: relative;
      top: 1px;

      button {
        background-color: #fff;
        border: 1px solid rgb(217, 217, 217);
        border-bottom-width: 0;
        display: flex;
        font-size: 11.5px;
        height: 21px;
        padding: 1px 8px;
        place-content: center;
        width: auto;
      }
    }
  }
`;

export default StyledProperties;
