import styled from 'styled-components';

const StyledTaskbarEntries = styled.ol`
  column-gap: 1px;
  display: flex;
  height: 100%;
  left: ${({ theme }) => theme.sizes.startButton.width};
  margin: 0 3px;
  position: absolute;
  right: ${({ theme }) => theme.sizes.clock.width};
`;

export default StyledTaskbarEntries;
