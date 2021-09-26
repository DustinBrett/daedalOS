import StyledVideoPlayer from "components/apps/VideoPlayer/StyledVideoPlayer";
import useVideoPlayer from "components/apps/VideoPlayer/useVideoPlayer";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const VideoPlayer = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(
    id,
    useVideoPlayer,
    StyledVideoPlayer,
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video className="video-js vjs-big-play-centered" />
  );

export default VideoPlayer;
