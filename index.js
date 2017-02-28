const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const getConfig = (chartName, dir) => {
  const chartNameLower = chartName.toLowerCase();
  const extractStyles = new ExtractTextPlugin(`${chartNameLower}.css`);

  return {
    devtool: 'source-map',

    entry: {
      [chartNameLower]: path.resolve(dir, 'src', 'index'),
      app: []
    },

    output: {
      path: path.resolve(dir, 'build'),
      filename: '[name].js',
      library: chartName,
      libraryTarget: 'umd',
      umdNamedDefine: true
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
    ],

    devServer: {
      host: '0.0.0.0',
      contentBase: [
        path.resolve(dir, 'public'),
        path.resolve(dir, 'node_modules')
      ]
    }
  };
};


module.exports = (chartName, dir, cb = () => void 0) => {
  const config = getConfig(chartName, dir);

  return {
    build() {
      return webpack(chartName).run(cb);
    },

    watch() {
      config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server");
      const server = new WebpackDevServer(webpack(config), {
        hot: true,
      });
      server.listen(8080);
    }
  };
};
