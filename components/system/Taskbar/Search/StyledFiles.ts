import styled from "styled-components";

const StyledFiles = styled.figure`
  ol {
    display: flex;
    flex-flow: row wrap;
    gap: 5px;
    padding-top: 8px;

    li {
      background-color: rgba(60, 60, 60, 85%);
      border: 1px solid rgba(75, 75, 75, 85%);
      border-radius: 15px;
      display: flex;
      padding: 3px 10px 5px;
      place-content: center;
      place-items: center;

      h2 {
        font-size: 13px;
        font-weight: 400;
      }

      picture,
      img {
        height: 16px;
        margin-right: 4px;
        width: 16px;
      }

      &:hover {
        background-color: rgba(80, 80, 80, 85%);
      }
    }
  }
`;

export default StyledFiles;
