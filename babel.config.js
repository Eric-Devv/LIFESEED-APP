module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/hooks': './src/hooks',
            '@/context': './src/context',
            '@/database': './src/database',
            '@/firebase': './src/firebase',
            '@/ai': './src/ai',
            '@/utils': './src/utils',
            '@/services': './src/services',
            '@/assets': './src/assets',
          },
        },
      ],
    ],
  };
};

