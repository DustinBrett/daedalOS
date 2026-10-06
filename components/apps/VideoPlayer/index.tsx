import StyledVideoPlayer from "components/apps/VideoPlayer/StyledVideoPlayer";
import useVideoPlayer from "components/apps/VideoPlayer/useVideoPlayer";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const VideoPlayer: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useVideoPlayer(containerProps);

  return (
    <AppContainer {...containerProps} StyledComponent={StyledVideoPlayer}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        aria-label="Video Player"
        className="video-js vjs-big-play-centered"
        id={id}
        autoPlay
      />
      <canvas aria-hidden="true" id={`${id}_canvas`} />
    </AppContainer>
  );
};

export default VideoPlayer;
