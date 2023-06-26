module.exports = options => {
  return {
    ...options,
    devtool: 'inline-cheap-module-source-map',
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
  };
};
