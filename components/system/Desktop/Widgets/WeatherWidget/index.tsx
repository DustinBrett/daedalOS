import { memo } from "react";
import StyledWeatherWidget from "components/system/Desktop/Widgets/WeatherWidget/StyledWeatherWidget";
import useWeather, {
  getWeatherEmoji,
} from "components/system/Desktop/Widgets/WeatherWidget/useWeather";
import useDraggableWidget, {
  type Position,
} from "components/system/Desktop/Widgets/useDraggableWidget";

type WeatherWidgetProps = {
  defaultPosition: Position;
};

const WeatherWidget: FC<WeatherWidgetProps> = ({ defaultPosition }) => {
  const { data, error, loading } = useWeather();
  const { dragHandleProps, style } = useDraggableWidget(defaultPosition);

  return (
    <StyledWeatherWidget data-widget="weather" style={style}>
      <div className="widget-header" {...dragHandleProps}>
        <span style={{ fontSize: "11px", opacity: 0.6 }}>Weather</span>
      </div>
      {loading && !data && (
        <div className="weather-loading">Loading weather...</div>
      )}
      {error && !data && (
        <div className="weather-error">Unable to load weather data</div>
      )}
      {data && (
        <div className="weather-body">
          <span className="weather-emoji">
            {getWeatherEmoji(data.description)}
          </span>
          <div className="weather-info">
            <span className="weather-temp">{data.tempC}&deg;C</span>
            <span className="weather-desc">{data.description}</span>
            <span className="weather-location">
              {data.city}
              {data.country ? `, ${data.country}` : ""}
            </span>
          </div>
        </div>
      )}
    </StyledWeatherWidget>
  );
};

export default memo(WeatherWidget);
