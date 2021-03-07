import styled from 'styled-components';

const StyledClock = styled.time`
  color: ${({ theme }) => theme.colors.opaqueWhite};
  display: flex;
  font-size: ${({ theme }) => theme.sizes.clock.fontSize};
  height: 100%;
  place-content: center;
  place-items: center;
  position: absolute;
  right: 0;
  width: ${({ theme }) => theme.sizes.clock.width};

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbarHover};
  }
`;

export default StyledClock;
