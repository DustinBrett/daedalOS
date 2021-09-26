const formats = {
  date: {
    month: "long",
    day: "numeric",
    year: "numeric",
  } as Intl.DateTimeFormatOptions,
  time: {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  } as Intl.DateTimeFormatOptions,
  dateModified: {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  } as Intl.DateTimeFormatOptions,
  systemFont:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
};

export default formats;
