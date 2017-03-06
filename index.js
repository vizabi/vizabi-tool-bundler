const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (chartName, chartNameLower, dir) => {
  const extractStyles = new ExtractTextPlugin(`${chartNameLower}.css`);

  return {
    devtool: 'source-map',

    entry: {
      [chartNameLower]: [
        path.resolve(dir, 'src', 'index')
      ],
    },

    output: {
      path: path.resolve(dir, 'build'),
      filename: '[name].js',
      // library: chartName,
      // libraryTarget: 'umd',
      // umdNamedDefine: true
    },

    resolveLoader: {
      modules: [
        'web_loaders',
        'web_modules',
        'node_loaders',
        'node_modules',
        path.resolve(__dirname, 'node_modules'),
      ],
    },
    resolve: {
      modules: [
        path.resolve(dir, 'src'),
        'node_modules'
      ]
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            cacheDirectory: true,
            presets: ['es2015']
          }
        },
        {
          test: /\.scss$/,
          include: [
            path.resolve(dir, 'src')
          ],
          loader: extractStyles.extract([
            {
              loader: "css-loader",
              options: {
                minimize: true,
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader'
            }
          ])
        },
        {
          test: /\.html$/,
          include: [
            path.resolve(dir, 'src')
          ],
          loader: 'html-loader'
        },
      ]
    },

    plugins: [
      new CleanWebpackPlugin(['build']),
      extractStyles,
      // new webpack.optimize.UglifyJsPlugin({
      //   sourceMap: true,
      //   compressor: {
      //     screw_ie8: true,
      //     warnings: false
      //   },
      //   mangle: {
      //     screw_ie8: true
      //   },
      //   output: {
      //     comments: false,
      //     screw_ie8: true
      //   }
      // })
    ],

  };
};