import styled from "styled-components";
import StyledWidget from "components/system/Desktop/Widgets/StyledWidget";

const StyledWeatherWidget = styled(StyledWidget)`
  min-width: 220px;

  .weather-body {
    display: flex;
    gap: 12px;
    padding: 2px 14px 14px;
  }

  .weather-emoji {
    font-size: 40px;
    line-height: 1;
  }

  .weather-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .weather-temp {
    font-size: 28px;
    font-weight: 300;
    line-height: 1;
  }

  .weather-desc {
    font-size: 12px;
    opacity: 80%;
  }

  .weather-location {
    font-size: 11px;
    opacity: 60%;
  }

  .weather-loading,
  .weather-error {
    font-size: 12px;
    opacity: 60%;
    padding: 8px 14px 14px;
  }
`;

export default StyledWeatherWidget;
