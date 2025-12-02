module.exports = function withRemoveMessageExtension(config) {
  if (config.ios) {
    delete config.ios.appExtensions;
    delete config.ios.includeInMessages;
  }
  return config;
};
