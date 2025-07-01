import { memo } from "react";
import StyledVideoPlayer from "components/apps/VideoPlayer/StyledVideoPlayer";
import useVideoPlayer from "components/apps/VideoPlayer/useVideoPlayer";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const VideoPlayer: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledVideoPlayer}
    id={id}
    useHook={useVideoPlayer}
  >
    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
    <video className="video-js vjs-big-play-centered" id={id} autoPlay />
    <canvas id={`${id}_canvas`} />
  </AppContainer>
);

export default memo(VideoPlayer);
