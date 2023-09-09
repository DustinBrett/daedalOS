import styled from "styled-components";

const StyledProfile = styled.figure`
  > div {
    position: relative;

    div.verified {
      svg {
        border: none;
        bottom: 2px;
        color: #000;
        fill: #000;
        height: 18px;
        left: -2px;
        max-height: auto;
        max-width: 18px;
        min-height: auto;
        min-width: 18px;
        position: absolute;
        width: 18px;
      }
    }
  }
`;

export default StyledProfile;
