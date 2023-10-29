import styled from "styled-components";

type StyledClockProps = {
  $width: number;
};

const StyledClock = styled.div<StyledClockProps>`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  font-size: ${({ theme }) => theme.sizes.clock.fontSize};
  height: 100%;
  max-width: ${({ theme, $width }) =>
    `calc(${$width}px + ${theme.sizes.clock.padding * 2}px)`};
  min-width: ${({ $width }) => `${$width}px`};
  padding: ${({ theme }) => `0 ${theme.sizes.clock.padding}px`};
  place-content: center;
  place-items: center;
  position: absolute;
  right: 0;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbar.hover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.taskbar.foreground};
  }
`;

export default StyledClock;
