const withImages = require('next-images');

module.exports = withImages({
  devIndicators: {
    autoPrerender: false
  },
  reactStrictMode: true
});
