"use strict";

var Path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  context: __dirname,
  output: {
    path: Path.resolve(__dirname, "../../public"),
    filename: "[name].js",
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style", "css", {
          publicPath: ""
        }),
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
    new ExtractTextPlugin("[name].css", {disable: false}),
  ],
};
