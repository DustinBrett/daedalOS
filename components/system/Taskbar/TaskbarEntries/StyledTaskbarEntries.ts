import styled from "styled-components";

type StyledTaskbarEntriesProps = {
  $clockWidth: number;
};

const StyledTaskbarEntries = styled.ol<StyledTaskbarEntriesProps>`
  column-gap: 1px;
  display: flex;
  height: 100%;
  left: ${({ theme }) => theme.sizes.startButton.width};
  margin: 0 3px;
  overflow: hidden;
  position: absolute;
  right: ${({ $clockWidth, theme }) =>
    `calc(${$clockWidth}px + ${theme.sizes.clock.padding * 2}px)`};
`;

export default StyledTaskbarEntries;
