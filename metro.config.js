const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const shouldForceWriteFileSystem = process.env.NODE_ENV !== "production";

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Keep filesystem CSS output for development, but disable it for production exports.
  // Static web export can fail when Metro hashes the generated cache file outside its watch set.
  forceWriteFileSystem: shouldForceWriteFileSystem,
});
