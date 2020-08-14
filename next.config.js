module.exports = {
  devIndicators: {
    autoPrerender: false,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.tsx?$/,
      },
      use: ['@svgr/webpack'],
    });

    return config;
  }
};
