const withImages = require('next-images');

module.exports = withImages({
  devIndicators: {
    autoPrerender: false
  },
  env: {
    lang: 'en',
    locale: 'en-US',
    millisecondsInSecond: 1000
  },
  reactStrictMode: true
});
