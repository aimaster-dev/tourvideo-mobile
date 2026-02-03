// metro.config.js
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  watchFolders: [
    path.resolve(__dirname, "ffmpeg-kit/react-native"),
  ],

  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
    getTransformOptions: async () => ({
      transform: {
        inlineRequires: true,
      },
    }),
  },

resolver: {
  assetExts: defaultConfig.resolver.assetExts.filter(
    (ext) => ext !== "svg"
  ),
  sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],

  extraNodeModules: {
    "react-native": path.resolve(__dirname, "node_modules/react-native"),
    react: path.resolve(__dirname, "node_modules/react"),
    "@babel/runtime": path.resolve(__dirname, "node_modules/@babel/runtime"),

    // 👇 ADD THESE
    crypto: require.resolve("react-native-crypto"),
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
  },

  // 👇 FORCE AXIOS TO USE BROWSER BUILD
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName === "axios") {
      return context.resolveRequest(
        context,
        "axios/dist/browser/axios.cjs",
        platform
      );
    }
    return context.resolveRequest(context, moduleName, platform);
  },

  blockList: [
    /.*\/ffmpeg-kit\/react-native\/node_modules\/.*/,
  ],
},

};

module.exports = mergeConfig(defaultConfig, config);
