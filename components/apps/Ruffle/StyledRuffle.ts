import styled from "styled-components";

const StyledRuffle = styled.div`
  height: 100%;
  width: 100%;

  &:before {
    color: #ffad33;
    content: "Drop an SWF/SPL file";
    position: absolute;
    font-size: 16px;
    font-weight: 600;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    place-content: center;
    place-items: center;
    display: flex;
  }

  ruffle-player {
    height: 100%;
    width: 100%;
  }
`;

export default StyledRuffle;
