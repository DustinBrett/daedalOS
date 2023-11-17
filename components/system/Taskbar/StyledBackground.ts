import styled from "styled-components";

type StyledStartMenuBackgroundProps = {
  $height?: string;
};

const StyledStartMenuBackground = styled.span<StyledStartMenuBackgroundProps>`
  backdrop-filter: blur(12px);
  height: ${({ $height }) => $height};
  inset: 0;
  position: absolute;
  width: 100%;
  z-index: -1;
`;

export default StyledStartMenuBackground;
