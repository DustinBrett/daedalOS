import styled from "styled-components";

const StyledFileManager = styled.ol`
  margin-left: 7px;
  margin-top: 7px;
  width: 100%;

  picture:not(:first-of-type) {
    position: absolute;
  }
`;

export default StyledFileManager;
