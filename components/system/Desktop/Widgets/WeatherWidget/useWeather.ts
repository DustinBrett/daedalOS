import { useCallback, useEffect, useRef, useState } from "react";

type WeatherCondition = {
  temp_C: string;
  temp_F: string;
  weatherDesc: { value: string }[];
  weatherIconUrl: { value: string }[];
};

type WttrResponse = {
  current_condition: WeatherCondition[];
  nearest_area: {
    areaName: { value: string }[];
    country: { value: string }[];
  }[];
};

type WeatherData = {
  city: string;
  country: string;
  description: string;
  tempC: string;
  tempF: string;
};

type UseWeatherReturn = {
  data: WeatherData | undefined;
  error: boolean;
  loading: boolean;
};

const WTTR_API = "https://wttr.in/?format=j1";
const REFRESH_INTERVAL_MS = 1_800_000; // 30 minutes

const WEATHER_EMOJI_MAP: Record<string, string> = {
  Clear: "\u2600\uFE0F",
  Cloudy: "\u2601\uFE0F",
  Fog: "\uD83C\uDF2B\uFE0F",
  "Heavy rain": "\uD83C\uDF27\uFE0F",
  "Heavy snow": "\u2744\uFE0F",
  "Light drizzle": "\uD83C\uDF26\uFE0F",
  "Light rain": "\uD83C\uDF26\uFE0F",
  "Light rain shower": "\uD83C\uDF26\uFE0F",
  "Light snow": "\uD83C\uDF28\uFE0F",
  "Moderate rain": "\uD83C\uDF27\uFE0F",
  "Moderate snow": "\uD83C\uDF28\uFE0F",
  Overcast: "\u2601\uFE0F",
  "Partly Cloudy": "\u26C5",
  "Partly cloudy": "\u26C5",
  "Patchy rain nearby": "\uD83C\uDF26\uFE0F",
  "Patchy rain possible": "\uD83C\uDF26\uFE0F",
  Sunny: "\u2600\uFE0F",
  Thunderstorm: "\u26C8\uFE0F",
};

export const getWeatherEmoji = (description: string): string =>
  WEATHER_EMOJI_MAP[description] ?? "\uD83C\uDF24\uFE0F";

const useWeather = (): UseWeatherReturn => {
  const [data, setData] = useState<WeatherData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchWeather = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(false);

      const response = await fetch(WTTR_API);

      if (!response.ok) {
        setError(true);
        return;
      }

      const json = (await response.json()) as WttrResponse;
      const condition = json.current_condition?.[0];
      const area = json.nearest_area?.[0];

      if (!condition || !area) {
        setError(true);
        return;
      }

      setData({
        city: area.areaName[0]?.value ?? "Unknown",
        country: area.country[0]?.value ?? "",
        description: condition.weatherDesc[0]?.value ?? "Unknown",
        tempC: condition.temp_C,
        tempF: condition.temp_F,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    intervalRef.current = setInterval(fetchWeather, REFRESH_INTERVAL_MS);

    return (): void => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchWeather]);

  return { data, error, loading };
};

export default useWeather;
