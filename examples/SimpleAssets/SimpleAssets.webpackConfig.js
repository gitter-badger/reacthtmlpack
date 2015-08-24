"use strict";

var Path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  context: __dirname,
  output: {
    path: Path.resolve(__dirname, "../../public"),
    filename: "[name]-[chunkhash].js",
  },
  resolve: {
    alias: {
      "react": Path.resolve(__dirname, "./node_modules/react"),
    },
  },
  resolveLoader: {
    root: Path.resolve(__dirname, "./node_modules")
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader", {
        publicPath: ""
      }) },
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        loader: "babel",
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin("NODE_ENV"),
    new ExtractTextPlugin("[name].css", {disable: false}),
  ],
};
