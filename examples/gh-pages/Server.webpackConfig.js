"use strict";

var Path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var JSX_LOADER_LIST;
var FILENAME_FORMAT;
var PRODUCTION_PLUGINS;

if ("production" === process.env.NODE_ENV) {
  PRODUCTION_PLUGINS = [
    // Safe effect as webpack -p
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
  ];
} else {
  PRODUCTION_PLUGINS = [];
}

var externals = [
  require("./package.json").dependencies,
  require("../../package.json").dependencies,
].reduce(function (acc, dependencies) {
  return acc.concat(
    Object.keys(dependencies)
      .map(function (key) { return new RegExp("^" + key); })
  );
}, []);

module.exports = {
  context: __dirname,
  output: {
    path: Path.resolve(__dirname, "../../public"),
    filename: "[name].js",
    library: true,
    libraryTarget: "commonjs2",
  },
  target: "node",
  externals: externals,
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: "null",
      },
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        loader: "babel",
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin("NODE_ENV"),
    new ExtractTextPlugin("[name]-[chunkhash].css", {
      disable: "production" !== process.env.NODE_ENV
    }),
  ].concat(PRODUCTION_PLUGINS),
};
