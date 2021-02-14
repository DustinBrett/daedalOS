import styled from 'styled-components';

const StyledTaskbarEntry = styled.li`
  background-color: pink;
  display: flex;
  height: 100%;
  place-content: center;
  place-items: center;
  width: ${({ theme }) => theme.sizes.taskbar.entry.width};
`;

export default StyledTaskbarEntry;
