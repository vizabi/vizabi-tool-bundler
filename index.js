const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const __PROD__ = process.env.NODE_ENV === 'production';

module.exports = (chartName, chartNameLower, dir, output) => {
  const extractStyles = new ExtractTextPlugin(`dist/${chartNameLower}.css`);

  return {
    devtool: 'source-map',

    entry: {
      [`dist/${chartNameLower}`]: [
        path.resolve(dir, 'src', 'index')
      ],
    },

    output: {
      path: output || path.resolve(dir, 'build'),
      filename: '[name].js'
    },

    resolveLoader: {
      modules: [
        'web_loaders',
        'web_modules',
        'node_loaders',
        'node_modules',
        path.resolve(dir, 'node_modules'),
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
        {
          test: /\.cur$/,
          include: [
            path.resolve(dir, 'src', 'assets', 'cursors')
          ],
          loader: 'file-loader',
          query: {
            publicPath: path => path.split('/').slice(1).join('/'),
            name: 'dist/assets/cursors/[name].[ext]',
          }
        },
      ]
    },

    plugins: [
      new CleanWebpackPlugin([path.resolve(dir, 'build')], { root: dir }),
      extractStyles,
      ...(__PROD__ ? [
          new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compressor: {
              screw_ie8: true,
              warnings: false
            },
            mangle: {
              screw_ie8: true
            },
            output: {
              comments: false,
              screw_ie8: true
            }
          })
        ] : [])
    ],

  };

};