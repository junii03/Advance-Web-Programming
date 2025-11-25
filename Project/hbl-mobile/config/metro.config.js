const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Get the project root (one level up from config/)
const projectRoot = path.resolve(__dirname, '..');

const config = getDefaultConfig(projectRoot);

module.exports = withNativeWind(config, { input: './global.css' });
