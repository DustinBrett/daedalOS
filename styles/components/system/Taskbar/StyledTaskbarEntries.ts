import styled from 'styled-components';

const StyledTaskbarEntries = styled.ol`
  height: 100%;
  left: ${({ theme }) => theme.sizes.startButton.width};
  position: absolute;
  right: ${({ theme }) => theme.sizes.clock.width};
`;

export default StyledTaskbarEntries;
