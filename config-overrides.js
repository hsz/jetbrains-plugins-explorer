const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { addBabelPlugin, override, addLessLoader } = require('customize-cra');

module.exports = override(
  addBabelPlugin(['babel-plugin-emotion', { sourceMap: true, autoLabel: true }]),
  addBabelPlugin([
    'import',
    {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true,
    },
  ]),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
    },
  }),
  config => ({
    ...config,
    plugins: config.plugins.concat([...(process.env.ANALYZER ? [new BundleAnalyzerPlugin()] : [])]),
  }),
);
