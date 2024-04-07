import styled from "styled-components";

type StyledBackgroundProps = {
  $height?: string;
};

const StyledBackground = styled.span<StyledBackgroundProps>`
  backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.panelBlur})`};
  height: ${({ $height }) => $height};
  inset: 0;
  position: absolute;
  width: 100%;
  z-index: -1;
`;

export default StyledBackground;
