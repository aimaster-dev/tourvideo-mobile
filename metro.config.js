//metro.config.js
const {getDefaultConfig} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    path.resolve(__dirname, '../ffmpeg-kit/react-native'),
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
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
     extraNodeModules: {
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime'),
    },
    blockList: [
      /.*\/ffmpeg-kit\/react-native\/node_modules\/.*/,
    ],
  }
};

module.exports = getDefaultConfig(__dirname, config);