const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Pega a configuração padrão do Metro
const config = getDefaultConfig(__dirname);

// Config para SVG
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.sourceExts.push("svg");

// Integra NativeWind
module.exports = withNativeWind(config, { input: "./global.css" });
