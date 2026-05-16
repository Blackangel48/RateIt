module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['inline-import', { extensions: ['.sql'] }],
      'react-native-reanimated/plugin', // doit être en dernier
    ],
  };
};
