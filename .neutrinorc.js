module.exports = {
  use: [
    ['neutrino-preset-mozilla-frontend-infra/styleguide', {
      components: 'src/components/**/*.jsx',
      skipComponentsWithoutExample: false,
    }],
    'neutrino-preset-mozilla-frontend-infra/react-components',
  ],
};
