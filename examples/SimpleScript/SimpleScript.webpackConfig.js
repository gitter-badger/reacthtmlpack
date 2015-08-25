"use strict";

var Path = require("path");
var webpack = require("webpack");

module.exports = {
  context: __dirname,
  output: {
    path: Path.resolve(__dirname, "../../public"),
    filename: "[name].js",
  },
  module: {
    loaders: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        loaders: ["babel"],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin("NODE_ENV"),
  ],
};
