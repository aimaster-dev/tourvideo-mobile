// metro.config.js
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],

    // --- Axios browser build fix ---
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === "axios" || moduleName.startsWith("axios/")) {
        return context.resolveRequest(
          {
            ...context,
            unstable_conditionNames: ["browser"], // forces browser build
          },
          moduleName,
          platform
        );
      }

      // Default resolution for all other modules
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);