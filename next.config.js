const withOptimizedImages = require('next-optimized-images');

module.exports = withOptimizedImages({
  devIndicators: {
    autoPrerender: false
  },
  env: {
    lang: 'en',
    locale: 'en-US'
  },
  reactStrictMode: true
});
