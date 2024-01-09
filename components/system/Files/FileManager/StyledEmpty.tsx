import styled from "styled-components";

const StyledEmpty = styled.div`
  position: absolute;
  width: 100%;

  &::before {
    color: #fff;
    content: "This folder is empty.";
    display: flex;
    font-size: 12px;
    font-weight: 200;
    justify-content: center;
    letter-spacing: 0.3px;
    mix-blend-mode: difference;
    padding-top: 14px;
  }
`;

export default StyledEmpty;
