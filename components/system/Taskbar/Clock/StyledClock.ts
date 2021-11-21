import styled from "styled-components";

const StyledClock = styled.time`
  position: absolute;
  right: 0;
  display: flex;
  width: ${({ theme }) => theme.sizes.clock.width};
  height: 100%;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.sizes.clock.fontSize};
  letter-spacing: -0.1px;
  place-content: center;
  place-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbar.hover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.taskbar.foreground};
  }
`;

export default StyledClock;
