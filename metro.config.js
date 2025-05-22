// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
//   server: {
//     port: 8081,
//     host: '0.0.0.0',
//   },
};