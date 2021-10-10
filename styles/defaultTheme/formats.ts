const formats = {
  date: {
    day: "numeric",
    month: "long",
    year: "numeric",
  } as Intl.DateTimeFormatOptions,
  dateModified: {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
  } as Intl.DateTimeFormatOptions,
  systemFont:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  time: {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    second: "2-digit",
  } as Intl.DateTimeFormatOptions,
};

export default formats;
