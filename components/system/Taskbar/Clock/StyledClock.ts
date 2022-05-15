import styled from "styled-components";

const StyledClock = styled.time`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  font-size: ${({ theme }) => theme.sizes.clock.fontSize};
  height: 100%;
  letter-spacing: -0.1px;
  max-width: ${({ theme }) => `calc(${theme.sizes.clock.width} + 10px)}`};
  min-width: ${({ theme }) => theme.sizes.clock.width};
  padding: 0 5px;
  place-content: center;
  place-items: center;
  position: absolute;
  right: 0;

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbar.hover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.taskbar.foreground};
  }
`;

export default StyledClock;
