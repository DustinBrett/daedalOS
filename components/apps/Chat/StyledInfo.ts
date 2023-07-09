import styled from "styled-components";

const StyledInfo = styled.li`
  padding-bottom: 15px;

  figure {
    display: flex;
    font-size: 14px;
    font-weight: 400;
    padding-left: 15px;

    figcaption {
      color: rgba(235, 219, 178);
      padding-left: 5px;

      b {
        font-weight: 600;
      }
    }
  }
`;

export default StyledInfo;
