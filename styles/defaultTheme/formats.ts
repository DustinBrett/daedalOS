const formats = {
  date: <Intl.DateTimeFormatOptions>{
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  },
  time: <Intl.DateTimeFormatOptions>{
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }
};

export default formats;
