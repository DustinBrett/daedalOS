import styled from "styled-components";

const StyledLoading = styled.div`
  cursor: progress;
  height: ${({ theme }) => `calc(100% - ${theme.sizes.taskbar.height})`};
  width: 100%;

  &::before {
    color: #fff;
    content: "Working on it...";
    display: flex;
    font-size: 12px;
    justify-content: center;
    padding-top: 18px;
  }
`;

export default StyledLoading;
