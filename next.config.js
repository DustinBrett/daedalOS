module.exports = {
  devIndicators: {
    autoPrerender: false
  },
  env: {
    lang: 'en',
    locale: 'en-US',
    millisecondsInSecond: 1000
  },
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.tsx?$/
      },
      use: ['@svgr/webpack']
    });

    return config;
  }
};
