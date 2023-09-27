import styled from "styled-components";

const StyledMessenger = styled.div`
  display: flex;
  flex-direction: column;

  > div:nth-child(2) {
    height: calc(100% - 69px);
    position: relative;
  }
`;

export default StyledMessenger;
