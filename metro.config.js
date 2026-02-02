const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support for lodash
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
