import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledDetails = styled.div`
  ${ScrollBars()}
  background-color: rgba(20, 20, 20, 95%);
  border: 8px solid rgba(30, 30, 30, 95%);
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
  }

  h2 {
    font-size: 13px;
    font-weight: 300;
  }

  table {
    border-bottom: 2px solid rgb(161, 161, 161);
    border-collapse: collapse;
    border-top: 2px solid rgb(161, 161, 161);
    display: grid;
    font-size: 12px;
    gap: 10px;
    margin-top: 15px;
    padding: 15px 0;

    th {
      max-width: 100px;
      min-width: 100px;
      padding: 10px;
      text-align: left;
      white-space: nowrap;
      width: 100px;
    }

    td {
      color: rgb(208, 208, 208);
      padding-right: 5px;
      word-break: break-all;
    }

    tr:first-child {
      td {
        text-decoration: underline;

        &:hover {
          color: #fff;
        }
      }
    }
  }

  ol {
    padding: 10px 0;
    width: 100%;

    li {
      button {
        color: #fff;
        display: flex;
        font-size: 12px;
        padding: 8px 18px;
        place-items: start;

        svg {
          fill: #fff;
          height: 16px;
          margin-right: 12px;
          width: 16px;
        }
      }

      &:hover {
        background-color: rgb(42, 42, 42);
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
      fill: #fff;
      height: 18px;
      margin-right: 2px;
      transform: scaleX(-1);
      width: 18px;
    }

    &:hover {
      background-color: rgba(255, 255, 255, 20%);
    }
  }
`;

export default StyledDetails;
