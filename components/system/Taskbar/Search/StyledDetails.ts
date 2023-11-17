import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledDetails = styled.div`
  ${ScrollBars()}
  background-color: rgba(29, 32, 33, 95%);
  border: 8px solid rgba(40, 40, 40, 95%);
  border-bottom: none;
  box-sizing: content-box;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding-top: 20px;
  place-items: center;
  position: relative;
  scrollbar-gutter: auto;
  width: 100%;

  picture {
    padding-bottom: 18px;
  }

  h1 {
    font-size: 15px;
    font-weight: 400;
    padding-bottom: 7px;
    padding-left: 12px;
    padding-right: 12px;
    word-break: break-all;

    &:hover {
      text-decoration: underline;
    }
  }

  h2 {
    font-size: 13px;
    font-weight: 300;
  }

  table {
    border-collapse: collapse;
    border-top: 2px solid rgb(146, 131, 116);
    display: grid;
    font-size: 12px;
    gap: 10px;
    margin-top: 15px;
    padding: 15px 0;
    padding-bottom: 0;
    width: 100%;

    th {
      max-width: 100px;
      min-width: 100px;
      padding: 10px;
      text-align: left;
      white-space: nowrap;
      width: 100px;
    }

    td {
      color: rgb(235, 219, 178);
      padding-right: 5px;
      word-break: break-all;
    }

    tr:first-child {
      td {
        text-decoration: underline;

        &:hover {
          color: #fbf1c7;
        }
      }
    }
  }

  ol {
    border-top: 2px solid rgb(146, 131, 116);
    margin-top: 15px;
    padding: 10px 0;
    width: 100%;

    li {
      button {
        color: #fbf1c7;
        display: flex;
        font-size: 12px;
        padding: 8px 18px;
        place-items: start;

        svg {
          fill: #fbf1c7;
          height: 16px;
          margin-right: 12px;
          width: 16px;
        }
      }

      &:hover {
        background-color: rgb(50, 48, 47);
      }
    }
  }

  .back {
    border-radius: 50%;
    display: flex;
    height: 32px;
    left: 6px;
    place-content: center;
    place-items: center;
    position: absolute;
    top: 6px;
    width: 32px;

    svg {
      fill: #fbf1c7;
      height: 18px;
      margin-right: 2px;
      transform: scaleX(-1);
      width: 18px;
    }

    &:hover {
      background-color: rgba(251, 241, 199, 20%);
    }
  }
`;

export default StyledDetails;
