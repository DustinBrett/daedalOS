import styled from "styled-components";
import Message from "styles/common/Message";

const StyledRuffle = styled.div`
  height: 100%;
  width: 100%;

  &.drop {
    ${Message("Drop SWF/SPL file here", "#ffad33")};
  }

  ruffle-player {
    height: 100%;
    width: 100%;
  }
`;

export default StyledRuffle;
