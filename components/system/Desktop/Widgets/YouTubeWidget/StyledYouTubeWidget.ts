import styled from "styled-components";
import StyledWidget from "components/system/Desktop/Widgets/StyledWidget";

const StyledYouTubeWidget = styled(StyledWidget)`
  width: 360px;

  .youtube-body {
    padding: 0 0 4px;
  }

  iframe {
    aspect-ratio: 16 / 9;
    border: 0;
    display: block;
    width: 100%;
  }
`;

export default StyledYouTubeWidget;
