import { memo } from "react";
import ClockWidget from "components/system/Desktop/Widgets/ClockWidget";
import WeatherWidget from "components/system/Desktop/Widgets/WeatherWidget";
import CalendarWidget from "components/system/Desktop/Widgets/CalendarWidget";
import YouTubeWidget from "components/system/Desktop/Widgets/YouTubeWidget";

const CLOCK_POSITION = { x: -260, y: 40 };
const WEATHER_POSITION = { x: -260, y: 200 };
const CALENDAR_POSITION = { x: -320, y: 360 };
const YOUTUBE_POSITION = { x: -400, y: 40 };

const WidgetManager: FC = () => (
  <>
    <ClockWidget defaultPosition={CLOCK_POSITION} />
    <WeatherWidget defaultPosition={WEATHER_POSITION} />
    <CalendarWidget defaultPosition={CALENDAR_POSITION} />
    <YouTubeWidget defaultPosition={YOUTUBE_POSITION} />
  </>
);

export default memo(WidgetManager);
