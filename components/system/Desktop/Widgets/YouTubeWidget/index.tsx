import { memo } from "react";
import StyledYouTubeWidget from "components/system/Desktop/Widgets/YouTubeWidget/StyledYouTubeWidget";
import useDraggableWidget, {
  type Position,
} from "components/system/Desktop/Widgets/useDraggableWidget";

const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ";
const EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`;

type YouTubeWidgetProps = {
  defaultPosition: Position;
};

const YouTubeWidget: FC<YouTubeWidgetProps> = ({ defaultPosition }) => {
  const { dragHandleProps, style } = useDraggableWidget(defaultPosition);

  return (
    <StyledYouTubeWidget data-widget="youtube" style={style}>
      <div className="widget-header" {...dragHandleProps}>
        <span style={{ fontSize: "11px", opacity: 0.6 }}>YouTube</span>
      </div>
      <div className="youtube-body">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          credentialless=""
          src={EMBED_URL}
          title="YouTube video"
          allowFullScreen
        />
      </div>
    </StyledYouTubeWidget>
  );
};

export default memo(YouTubeWidget);
