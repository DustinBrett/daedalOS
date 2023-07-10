import styled from "styled-components";

const StyledEmulator = styled.div`
  &.drop {
    &::before {
      color: #f9f5d7;
      content: "Drop rom file here";
      display: flex;
      font-size: 16px;
      font-weight: 600;
      height: 100%;
      left: 0;
      place-content: center;
      place-items: center;
      position: absolute;
      top: 0;
      width: 100%;
    }
  }
`;

export default StyledEmulator;
