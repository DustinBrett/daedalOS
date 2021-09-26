import styled from "styled-components";

const StyledVideoPlayer = styled.div`
  display: flex;
  height: ${({ theme }) =>
    `calc(100% - ${theme.sizes.titleBar.height}) !important`};
  width: 100%;

  .video-js {
    height: 100%;
    width: 100%;

    .vjs-poster {
      background-size: contain;
    }
  }
`;

export default StyledVideoPlayer;
