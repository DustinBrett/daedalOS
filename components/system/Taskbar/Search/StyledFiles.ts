import styled from "styled-components";

const StyledFiles = styled.figure`
  ol {
    display: flex;
    flex-flow: row wrap;
    gap: 6px;
    padding-top: 9px;

    li {
      background-color: rgba(60, 56, 54, 85%);
      border: 1px solid rgba(80, 73, 69, 85%);
      border-radius: 15px;
      display: flex;
      padding: 4px 10px;
      place-content: center;
      place-items: center;

      h2 {
        bottom: 1px;
        display: flex;
        font-size: 12px;
        font-weight: 400;
        height: 16px;
        place-items: center;
        position: relative;
      }

      picture,
      img {
        height: 16px;
        margin-right: 5px;
        width: 16px;
      }

      &:hover {
        background-color: rgba(80, 73, 69, 85%);
      }
    }
  }
`;

export default StyledFiles;
