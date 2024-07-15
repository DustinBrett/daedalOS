import styled from "styled-components";
import Message from "styles/common/Message";

const StyledEmulator = styled.div`
  &.drop {
    ${Message("Drop rom file here", "#f1f1f1")};
  }
`;

export default StyledEmulator;
