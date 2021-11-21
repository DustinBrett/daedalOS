import styled from "styled-components";

const StyledTaskbarEntries = styled.ol`
  position: absolute;
  right: ${({ theme }) => theme.sizes.clock.width};
  left: ${({ theme }) => theme.sizes.startButton.width};
  display: flex;
  overflow: hidden;
  height: 100%;
  margin: 0 3px;
  column-gap: 1px;
`;

export default StyledTaskbarEntries;
