/* eslint @typescript-eslint/no-var-requires: off */
const withImages = require('next-images');

module.exports = withImages({
  devIndicators: {
    autoPrerender: false
  },
  env: {
    lang: 'en',
    locale: 'en-US'
  },
  reactStrictMode: true
});
